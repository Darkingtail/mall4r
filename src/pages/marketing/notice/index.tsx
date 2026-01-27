import { type Notice, noticeApi } from "@/service/api/marketing/notice";
import {
	App,
	Button,
	Form,
	Input,
	Popconfirm,
	Select,
	Space,
	Table,
	Tag,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import NoticeModal, { type NoticeModalType } from "./NoticeModal";

const statusOptions = [
	{ label: "全部", value: "" },
	{ label: "已公布", value: 1 },
	{ label: "已撤回", value: 0 },
];

const topOptions = [
	{ label: "全部", value: "" },
	{ label: "置顶", value: 1 },
	{ label: "不置顶", value: 0 },
];

export default function NoticePage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<Notice[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<NoticeModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (
			page = 1,
			size = 10,
			title?: string,
			status?: number | "",
			isTop?: number | "",
		) => {
			setLoading(true);
			try {
				const res = await noticeApi.fetchPage({
					current: page,
					size,
					title,
					status: status === "" ? undefined : status,
					isTop: isTop === "" ? undefined : isTop,
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

	const handleSearch = (values: {
		title?: string;
		status?: number | "";
		isTop?: number | "";
	}) => {
		fetchDataSource(
			1,
			pagination.pageSize,
			values.title,
			values.status,
			values.isTop,
		);
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
			values.title,
			values.status,
			values.isTop,
		);
	};

	const handleDelete = async (id: number) => {
		try {
			await noticeApi.delete(id);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: NoticeModalType, id?: number) => {
		setModalType(type);
		setEditingId(id ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<Notice> = [
		{
			title: "标题",
			dataIndex: "title",
			key: "title",
			width: 200,
			ellipsis: true,
		},
		{
			title: "内容",
			dataIndex: "content",
			key: "content",
			width: 300,
			ellipsis: true,
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			width: 80,
			align: "center",
			render: (status) =>
				status === 1 ? (
					<Tag color="success">已公布</Tag>
				) : (
					<Tag color="default">已撤回</Tag>
				),
		},
		{
			title: "置顶",
			dataIndex: "isTop",
			key: "isTop",
			width: 80,
			align: "center",
			render: (isTop) =>
				isTop === 1 ? (
					<Tag color="processing">置顶</Tag>
				) : (
					<Tag color="default">否</Tag>
				),
		},
		{
			title: "发布时间",
			dataIndex: "publishTime",
			key: "publishTime",
			width: 160,
		},
		{
			title: "更新时间",
			dataIndex: "updateTime",
			key: "updateTime",
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
						onClick={() => openModal("update", record.id)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该公告吗？"
						onConfirm={() => handleDelete(record.id!)}
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
				<Form.Item name="title" label="标题">
					<Input placeholder="请输入标题" allowClear style={{ width: 160 }} />
				</Form.Item>
				<Form.Item name="status" label="状态" initialValue="">
					<Select options={statusOptions} style={{ width: 100 }} />
				</Form.Item>
				<Form.Item name="isTop" label="置顶" initialValue="">
					<Select options={topOptions} style={{ width: 100 }} />
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
				rowKey="id"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 1100 }}
			/>

			<NoticeModal
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
