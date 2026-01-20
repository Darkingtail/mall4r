import { type Brand, brandApi } from "@/service/api/prod/brand";
import {
	App,
	Button,
	Form,
	Image,
	Input,
	Popconfirm,
	Space,
	Table,
	Tag,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import BrandModal, { type BrandModalType } from "./BrandModal";

export default function BrandPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<Brand[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<BrandModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, brandName?: string) => {
			setLoading(true);
			try {
				const res = await brandApi.fetchPage({
					current: page,
					size,
					brandName,
				});
				setDataSource(res.records);
				setPagination((prev) => ({
					...prev,
					current: res.current,
					pageSize: res.size,
					total: res.total,
				}));
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const handleSearch = (values: { brandName?: string }) => {
		fetchDataSource(1, pagination.pageSize, values.brandName);
	};

	const handleReset = () => {
		searchForm.resetFields();
		fetchDataSource(1, pagination.pageSize);
	};

	const handleTableChange = (newPagination: TablePaginationConfig) => {
		const values = searchForm.getFieldsValue();
		fetchDataSource(
			newPagination.current,
			newPagination.pageSize,
			values.brandName,
		);
	};

	const handleDelete = async (brandId: number) => {
		try {
			await brandApi.delete(brandId);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: BrandModalType, brandId?: number) => {
		setModalType(type);
		setEditingId(brandId ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<Brand> = [
		{
			title: "品牌图片",
			dataIndex: "brandPic",
			key: "brandPic",
			width: 100,
			align: "center",
			render: (pic) =>
				pic ? (
					<Image src={pic} width={60} height={60} style={{ objectFit: "cover" }} />
				) : (
					"-"
				),
		},
		{
			title: "品牌名称",
			dataIndex: "brandName",
			key: "brandName",
			width: 150,
		},
		{
			title: "首字母",
			dataIndex: "firstChar",
			key: "firstChar",
			width: 80,
			align: "center",
		},
		{
			title: "简介",
			dataIndex: "brief",
			key: "brief",
			width: 200,
			ellipsis: true,
		},
		{
			title: "排序",
			dataIndex: "seq",
			key: "seq",
			width: 80,
			align: "center",
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			width: 80,
			align: "center",
			render: (status) =>
				status === 1 ? (
					<Tag color="success">正常</Tag>
				) : (
					<Tag color="default">下线</Tag>
				),
		},
		{
			title: "操作",
			key: "action",
			width: 120,
			align: "center",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						size="small"
						onClick={() => openModal("update", record.brandId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该品牌吗？"
						onConfirm={() => handleDelete(record.brandId!)}
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
			<Form
				form={searchForm}
				layout="inline"
				onFinish={handleSearch}
				className="mb-4"
			>
				<Form.Item name="brandName" label="品牌名称">
					<Input placeholder="请输入品牌名称" allowClear style={{ width: 180 }} />
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" htmlType="submit">
							搜索
						</Button>
						<Button onClick={handleReset}>重置</Button>
						<Button type="primary" onClick={() => openModal("add")}>
							新增
						</Button>
					</Space>
				</Form.Item>
			</Form>

			<Table
				rowKey="brandId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
			/>

			<BrandModal
				open={modalVisible}
				type={modalType}
				editingId={editingId}
				onOk={() => {
					setModalVisible(false);
					fetchDataSource(pagination.current, pagination.pageSize);
				}}
				onCancel={() => setModalVisible(false)}
			/>
		</div>
	);
}
