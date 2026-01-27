import { type IndexImg, indexImgApi } from "@/service/api/marketing/indexImg";
import {
	App,
	Button,
	Form,
	Image,
	Popconfirm,
	Select,
	Space,
	Table,
	Tag,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import IndexImgModal, { type IndexImgModalType } from "./IndexImgModal";

const statusOptions = [
	{ label: "全部", value: "" },
	{ label: "启用", value: 1 },
	{ label: "禁用", value: 0 },
];

export default function IndexImgPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<IndexImg[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<IndexImgModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, status?: number | "") => {
			setLoading(true);
			try {
				const res = await indexImgApi.fetchPage({
					current: page,
					size,
					status: status === "" ? undefined : status,
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

	const handleSearch = (values: { status?: number | "" }) => {
		fetchDataSource(1, pagination.pageSize, values.status);
	};

	const handleReset = () => {
		searchForm.resetFields();
		fetchDataSource(1, pagination.pageSize);
	};

	const handleTableChange = (newPagination: TablePaginationConfig) => {
		const values = searchForm.getFieldsValue();
		fetchDataSource(newPagination.current, newPagination.pageSize, values.status);
	};

	const handleDelete = async (imgId: number) => {
		try {
			await indexImgApi.delete([imgId]);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: IndexImgModalType, imgId?: number) => {
		setModalType(type);
		setEditingId(imgId ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<IndexImg> = [
		{
			title: "图片",
			dataIndex: "imgUrl",
			key: "imgUrl",
			width: 120,
			render: (url) =>
				url ? (
					<Image
						src={url}
						width={100}
						height={50}
						style={{ objectFit: "cover" }}
					/>
				) : (
					"-"
				),
		},
		{
			title: "标题",
			dataIndex: "title",
			key: "title",
			width: 150,
			ellipsis: true,
		},
		{
			title: "描述",
			dataIndex: "des",
			key: "des",
			width: 200,
			ellipsis: true,
		},
		{
			title: "链接",
			dataIndex: "link",
			key: "link",
			width: 200,
			ellipsis: true,
			render: (link) =>
				link ? (
					<a href={link} target="_blank" rel="noopener noreferrer">
						{link}
					</a>
				) : (
					"-"
				),
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
					<Tag color="success">启用</Tag>
				) : (
					<Tag color="default">禁用</Tag>
				),
		},
		{
			title: "上传时间",
			dataIndex: "uploadTime",
			key: "uploadTime",
			width: 160,
		},
		{
			title: "操作",
			key: "action",
			width: 120,
			align: "center",
			fixed: "right",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						size="small"
						onClick={() => openModal("update", record.imgId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该轮播图吗？"
						onConfirm={() => handleDelete(record.imgId!)}
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
				<Form.Item name="status" label="状态" initialValue="">
					<Select options={statusOptions} style={{ width: 120 }} />
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
				rowKey="imgId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 1100 }}
			/>

			<IndexImgModal
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
