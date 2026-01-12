import { type Category, categoryApi } from "@/service/api/prod/category";
import { App, Button, Image, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import CategoryModal, { type CategoryModalType } from "./CategoryModal";

// 将后端返回的扁平数据转换为树形结构
function treeDataTranslate(
	data: Category[],
	idKey = "categoryId",
	parentKey = "parentId",
): Category[] {
	const map = new Map<number, Category & { children?: Category[] }>();
	const tree: Category[] = [];

	// 第一次遍历：创建所有节点的映射
	for (const item of data) {
		map.set(item[idKey as keyof Category] as number, { ...item, children: [] });
	}

	// 第二次遍历：构建树形结构
	for (const item of data) {
		const node = map.get(item[idKey as keyof Category] as number)!;
		const parentId = item[parentKey as keyof Category] as number;

		if (parentId === 0 || !map.has(parentId)) {
			tree.push(node);
		} else {
			const parent = map.get(parentId)!;
			parent.children = parent.children || [];
			parent.children.push(node);
		}
	}

	return tree;
}

export default function CategoryPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<Category[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<CategoryModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(async () => {
		setLoading(true);
		try {
			const res = await categoryApi.getTableData();
			const treeData = treeDataTranslate(res);
			setDataSource(treeData);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const handleDelete = async (categoryId: number) => {
		try {
			await categoryApi.delete(categoryId);
			message.success("删除成功");
			fetchDataSource();
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: CategoryModalType, categoryId?: number) => {
		setModalType(type);
		setEditingId(categoryId || null);
		setModalVisible(true);
	};

	const columns: ColumnsType<Category> = [
		{
			title: "分类名称",
			dataIndex: "categoryName",
			key: "categoryName",
			width: 200,
		},
		{
			title: "图片",
			dataIndex: "pic",
			key: "pic",
			width: 220,
			align: "center",
			render: (pic: string) =>
				pic ? (
					<Image
						src={pic}
						width={200}
						height={80}
						className="object-cover"
					/>
				) : (
					<span className="text-gray-400">无图片</span>
				),
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			width: 100,
			align: "center",
			render: (status: number) => (
				<Tag color={status === 1 ? "success" : "error"}>
					{status === 1 ? "正常" : "下线"}
				</Tag>
			),
		},
		{
			title: "排序号",
			dataIndex: "seq",
			key: "seq",
			width: 100,
			align: "center",
		},
		{
			title: "操作",
			key: "action",
			width: 150,
			align: "center",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						size="small"
						onClick={() => openModal("update", record.categoryId)}
					>
						修改
					</Button>
					<Popconfirm
						title="确定删除吗？"
						onConfirm={() => handleDelete(record.categoryId)}
					>
						<Button type="link" danger size="small">
							删除
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div className="rounded-lg bg-white p-4 shadow-sm">
			<div className="mb-4">
				<Button type="primary" onClick={() => openModal("add")}>
					新增
				</Button>
			</div>

			<Table
				rowKey="categoryId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={false}
				childrenColumnName="children"
				defaultExpandAllRows
			/>

			<CategoryModal
				open={modalVisible}
				type={modalType}
				editingId={editingId}
				onOk={() => {
					setModalVisible(false);
					fetchDataSource();
				}}
				onCancel={() => setModalVisible(false)}
			/>
		</div>
	);
}
