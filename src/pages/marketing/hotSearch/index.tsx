import { type HotSearch, hotSearchApi } from "@/service/api/marketing/hotSearch";
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
import HotSearchModal, { type HotSearchModalType } from "./HotSearchModal";

const statusOptions = [
	{ label: "全部", value: "" },
	{ label: "正常", value: 1 },
	{ label: "下线", value: 0 },
];

export default function HotSearchPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<HotSearch[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<HotSearchModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (
			page = 1,
			size = 10,
			title?: string,
			content?: string,
			status?: number | "",
		) => {
			setLoading(true);
			try {
				const res = await hotSearchApi.fetchPage({
					current: page,
					size,
					title,
					content,
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

	const handleSearch = (values: {
		title?: string;
		content?: string;
		status?: number | "";
	}) => {
		fetchDataSource(
			1,
			pagination.pageSize,
			values.title,
			values.content,
			values.status,
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
			values.content,
			values.status,
		);
	};

	const handleDelete = async (hotSearchId: number) => {
		try {
			await hotSearchApi.delete([hotSearchId]);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: HotSearchModalType, hotSearchId?: number) => {
		setModalType(type);
		setEditingId(hotSearchId ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<HotSearch> = [
		{
			title: "标题",
			dataIndex: "title",
			key: "title",
			width: 150,
		},
		{
			title: "搜索词",
			dataIndex: "content",
			key: "content",
			width: 200,
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
			title: "录入时间",
			dataIndex: "recDate",
			key: "recDate",
			width: 160,
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
						onClick={() => openModal("update", record.hotSearchId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该热搜吗？"
						onConfirm={() => handleDelete(record.hotSearchId!)}
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
					<Input placeholder="请输入标题" allowClear style={{ width: 150 }} />
				</Form.Item>
				<Form.Item name="content" label="搜索词">
					<Input placeholder="请输入搜索词" allowClear style={{ width: 150 }} />
				</Form.Item>
				<Form.Item name="status" label="状态" initialValue="">
					<Select options={statusOptions} style={{ width: 100 }} />
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
				rowKey="hotSearchId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
			/>

			<HotSearchModal
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
