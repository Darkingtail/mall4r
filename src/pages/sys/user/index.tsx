import { type SysUser, sysUserApi } from "@/service/api/sys/user";
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
import SysUserModal, { type SysUserModalType } from "./SysUserModal";

const statusOptions = [
	{ label: "全部", value: "" },
	{ label: "正常", value: 1 },
	{ label: "禁用", value: 0 },
];

export default function SysUserPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<SysUser[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<SysUserModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (
			page = 1,
			size = 10,
			username?: string,
		) => {
			setLoading(true);
			try {
				const res = await sysUserApi.fetchPage({
					current: page,
					size,
					username,
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

	const handleSearch = (values: { username?: string }) => {
		fetchDataSource(1, pagination.pageSize, values.username);
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
			values.username,
		);
	};

	const handleDelete = async (userId: number) => {
		try {
			await sysUserApi.delete([userId]);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: SysUserModalType, userId?: number) => {
		setModalType(type);
		setEditingId(userId ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<SysUser> = [
		{
			title: "用户名",
			dataIndex: "username",
			key: "username",
			width: 120,
		},
		{
			title: "邮箱",
			dataIndex: "email",
			key: "email",
			width: 180,
			render: (val) => val || "-",
		},
		{
			title: "手机号",
			dataIndex: "mobile",
			key: "mobile",
			width: 130,
			render: (val) => val || "-",
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
					<Tag color="error">禁用</Tag>
				),
		},
		{
			title: "创建时间",
			dataIndex: "createTime",
			key: "createTime",
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
						onClick={() => openModal("update", record.userId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该管理员吗？"
						onConfirm={() => handleDelete(record.userId!)}
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
				<Form.Item name="username" label="用户名">
					<Input placeholder="请输入用户名" allowClear style={{ width: 150 }} />
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
				rowKey="userId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 800 }}
			/>

			<SysUserModal
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
