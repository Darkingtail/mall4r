import { type ProdTag, prodTagApi } from "@/service/api/prod/prodTag";
import { App, Button, Form, Input, Popconfirm, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import { ProdTagModal, type ProdTagModalType } from "./ProdTagModal";

export default function ProdTagPage() {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<ProdTag[]>([]);
	const [total, setTotal] = useState(0);
	const [current, setCurrent] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<ProdTagModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(async () => {
		setLoading(true);
		try {
			const values = await form.getFieldsValue();
			const res = await prodTagApi.fetchProdTagPage({
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

	const handleDelete = async (id: number) => {
		try {
			await prodTagApi.deleteProdTag(id);
			message.success("删除成功");
			fetchDataSource();
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: ProdTagModalType, id?: number) => {
		setModalType(type);
		setEditingId(id || null);
		setModalVisible(true);
	};

	const columns: ColumnsType<ProdTag> = [
		{
			title: "标签名称",
			dataIndex: "title",
			key: "title",
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			render: (status: number) => (
				<Tag color={status === 1 ? "success" : "error"}>{status === 1 ? "正常" : "禁用"}</Tag>
			),
		},
		{
			title: "列表风格",
			dataIndex: "style",
			key: "style",
			render: (style: number) => {
				const styleMap: Record<number, string> = {
					0: "一列一个",
					1: "一列两个",
					2: "一列三个",
				};
				return styleMap[style] || "未知";
			},
		},
		{
			title: "排序",
			dataIndex: "seq",
			key: "seq",
		},
		{
			title: "操作",
			key: "action",
			render: (_, record) => (
				<Space>
					<Button type="link" size="small" onClick={() => openModal("update", record.id)}>
						修改
					</Button>
					<Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id!)}>
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
				<Form.Item name="title" label="标签名称">
					<Input placeholder="请输入标签名称" allowClear />
				</Form.Item>
				<Form.Item name="status" label="状态">
					<Select
						placeholder="请选择状态"
						allowClear
						style={{ width: 120 }}
						options={[
							{ value: 1, label: "正常" },
							{ value: 0, label: "禁用" },
						]}
					/>
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" onClick={handleSearch}>
							查询
						</Button>
						<Button onClick={handleReset}>重置</Button>
						<Button type="primary" onClick={() => openModal("add")}>
							新增
						</Button>
					</Space>
				</Form.Item>
			</Form>

			<Table
				rowKey="id"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
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

			<ProdTagModal
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
