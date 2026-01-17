import {
	type ProdListItem,
	prodListApi,
} from "@/service/api/prod/prod-list";
import {
	App,
	Button,
	Form,
	Image,
	Input,
	Popconfirm,
	Select,
	Space,
	Table,
	Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import DetailModal from "./detail-modal";

export default function ProdListPage() {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<ProdListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [current, setCurrent] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalType, setModalType] = useState<"add" | "edit">("add");
	const [editingProdId, setEditingProdId] = useState<number | undefined>();

	const { message } = App.useApp();

	const fetchDataSource = useCallback(async () => {
		setLoading(true);
		try {
			const values = await form.getFieldsValue();
			const res = await prodListApi.fetchProdListPage({
				current,
				size: pageSize,
				...values,
			});
			setDataSource(res.records);
			setTotal(res.total);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [current, pageSize, form]);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const handleSearch = () => {
		setCurrent(1);
		fetchDataSource();
	};

	const handleReset = () => {
		form.resetFields();
		setCurrent(1);
		fetchDataSource();
	};

	const handleDelete = async (ids: number[]) => {
		try {
			await prodListApi.deleteProd(ids);
			message.success("删除成功");
			setSelectedRowKeys([]);
			fetchDataSource();
		} catch (error) {
			console.error(error);
		}
	};

	const handleAddOrUpdate = (prodId?: number) => {
		if (prodId) {
			setModalType("edit");
			setEditingProdId(prodId);
		} else {
			setModalType("add");
			setEditingProdId(undefined);
		}
		setModalOpen(true);
	};

	const columns: ColumnsType<ProdListItem> = [
		{
			title: "商品图片",
			dataIndex: "pic",
			key: "pic",
			width: 100,
			render: (pic: string, record) => {
				// 优先使用 pic，如果没有则尝试从 imgs 中取第一张
				let imgUrl = pic;
				if (!imgUrl && record.imgs) {
					imgUrl = record.imgs.split(",")[0];
				}
				// 简单的占位符处理，实际项目中可以用默认图
				return imgUrl ? (
					<Image src={imgUrl} width={50} height={50} className="object-cover" />
				) : (
					<div className="flex h-[50px] w-[50px] items-center justify-center bg-gray-100 text-xs text-gray-400">
						无图
					</div>
				);
			},
		},
		{
			title: "商品名称",
			dataIndex: "prodName",
			key: "prodName",
			ellipsis: true,
		},
		{
			title: "原价",
			dataIndex: "oriPrice",
			key: "oriPrice",
			render: (price) => `¥${price}`,
		},
		{
			title: "现价",
			dataIndex: "price",
			key: "price",
			render: (price) => <span className="text-red-500">¥{price}</span>,
		},
		{
			title: "库存",
			dataIndex: "totalStocks",
			key: "totalStocks",
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			render: (status: number) => (
				<Tag color={status === 1 ? "success" : "default"}>
					{status === 1 ? "上架" : "下架"}
				</Tag>
			),
		},
		{
			title: "操作",
			key: "action",
			width: 180,
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						size="small"
						onClick={() => handleAddOrUpdate(record.prodId)}
					>
						修改
					</Button>
					<Popconfirm
						title="确定删除吗？"
						onConfirm={() => handleDelete([record.prodId])}
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
		<div className="p-4 bg-white rounded-lg shadow-sm">
			<Form form={form} layout="inline" className="mb-4">
				<Form.Item name="prodName" label="商品名称">
					<Input placeholder="请输入商品名称" allowClear />
				</Form.Item>
				<Form.Item name="status" label="状态">
					<Select
						placeholder="请选择状态"
						allowClear
						style={{ width: 120 }}
						options={[
							{ label: "上架", value: 1 },
							{ label: "下架", value: 0 },
						]}
					/>
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" onClick={handleSearch}>
							查询
						</Button>
						<Button onClick={handleReset}>重置</Button>
					</Space>
				</Form.Item>
			</Form>

			<div className="mb-4">
				<Space>
					<Button type="primary" onClick={() => handleAddOrUpdate()}>
						新增商品
					</Button>
					<Popconfirm
						title="确定删除选中的商品吗？"
						disabled={selectedRowKeys.length === 0}
						onConfirm={() => handleDelete(selectedRowKeys as number[])}
					>
						<Button danger disabled={selectedRowKeys.length === 0}>
							批量删除
						</Button>
					</Popconfirm>
				</Space>
			</div>

			<Table
				rowKey="prodId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				rowSelection={{
					selectedRowKeys,
					onChange: setSelectedRowKeys,
				}}
				pagination={{
					current,
					pageSize,
					total,
					showSizeChanger: true,
					onChange: (page, size) => {
						setCurrent(page);
						setPageSize(size);
					},
				}}
			/>

			<DetailModal
				isModalOpen={modalOpen}
				setIsModalOpen={setModalOpen}
				type={modalType}
				prodId={editingProdId}
				onSuccess={fetchDataSource}
			/>
		</div>
	);
}