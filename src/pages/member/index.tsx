import { type Member, SEX_MAP, memberApi } from "@/service/api/member";
import {
	App,
	Avatar,
	Button,
	Form,
	Input,
	Popconfirm,
	Select,
	Space,
	Table,
	Tag,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import MemberModal from "./MemberModal";

const statusOptions = [
	{ label: "全部", value: "" },
	{ label: "正常", value: 1 },
	{ label: "无效", value: 0 },
];

export default function MemberPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<Member[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, nickName?: string, status?: number | "") => {
			setLoading(true);
			try {
				const res = await memberApi.fetchPage({
					current: page,
					size,
					nickName,
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

	const handleSearch = (values: { nickName?: string; status?: number | "" }) => {
		fetchDataSource(1, pagination.pageSize, values.nickName, values.status);
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
			values.nickName,
			values.status,
		);
	};

	const handleDelete = async (userId: string) => {
		try {
			await memberApi.delete([userId]);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (userId: string) => {
		setEditingId(userId);
		setModalVisible(true);
	};

	const columns: ColumnsType<Member> = [
		{
			title: "头像",
			dataIndex: "pic",
			key: "pic",
			width: 80,
			align: "center",
			render: (pic) => (
				<Avatar src={pic} icon={<UserOutlined />} size={40} />
			),
		},
		{
			title: "昵称",
			dataIndex: "nickName",
			key: "nickName",
			width: 120,
		},
		{
			title: "真实姓名",
			dataIndex: "realName",
			key: "realName",
			width: 100,
			render: (val) => val || "-",
		},
		{
			title: "手机号",
			dataIndex: "userMobile",
			key: "userMobile",
			width: 120,
			render: (val) => val || "-",
		},
		{
			title: "性别",
			dataIndex: "sex",
			key: "sex",
			width: 60,
			align: "center",
			render: (sex) => (sex ? SEX_MAP[sex] || "-" : "-"),
		},
		{
			title: "积分",
			dataIndex: "score",
			key: "score",
			width: 80,
			align: "center",
			render: (val) => val ?? 0,
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
					<Tag color="error">无效</Tag>
				),
		},
		{
			title: "注册时间",
			dataIndex: "userRegtime",
			key: "userRegtime",
			width: 160,
		},
		{
			title: "最后登录",
			dataIndex: "userLasttime",
			key: "userLasttime",
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
						onClick={() => openModal(record.userId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该用户吗？"
						onConfirm={() => handleDelete(record.userId)}
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
				<Form.Item name="nickName" label="昵称">
					<Input placeholder="请输入昵称" allowClear style={{ width: 150 }} />
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
					</Space>
				</Form.Item>
			</Form>

			<Table
				rowKey="userId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 1100 }}
			/>

			<MemberModal
				open={modalVisible}
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
