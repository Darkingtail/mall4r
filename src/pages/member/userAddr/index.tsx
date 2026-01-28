import { type UserAddr, userAddrApi } from "@/service/api/member/userAddr";
import { App, Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import UserAddrModal, { type UserAddrModalType } from "./UserAddrModal";

export default function UserAddrPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<UserAddr[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<UserAddrModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(async (page = 1, size = 10) => {
		setLoading(true);
		try {
			const res = await userAddrApi.fetchPage({
				current: page,
				size,
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
	}, []);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const handleTableChange = (newPagination: TablePaginationConfig) => {
		fetchDataSource(newPagination.current, newPagination.pageSize);
	};

	const handleDelete = async (addrId: number) => {
		try {
			await userAddrApi.delete(addrId);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: UserAddrModalType, addrId?: number) => {
		setModalType(type);
		setEditingId(addrId ?? null);
		setModalVisible(true);
	};

	const getFullAddress = (record: UserAddr) => {
		return `${record.province}${record.city}${record.area}${record.addr}`;
	};

	const columns: ColumnsType<UserAddr> = [
		{
			title: "收货人",
			dataIndex: "receiver",
			key: "receiver",
			width: 100,
		},
		{
			title: "手机号",
			dataIndex: "mobile",
			key: "mobile",
			width: 120,
		},
		{
			title: "收货地址",
			key: "address",
			width: 300,
			ellipsis: true,
			render: (_, record) => getFullAddress(record),
		},
		{
			title: "邮编",
			dataIndex: "postCode",
			key: "postCode",
			width: 80,
			render: (val) => val || "-",
		},
		{
			title: "默认地址",
			dataIndex: "commonAddr",
			key: "commonAddr",
			width: 90,
			align: "center",
			render: (commonAddr) =>
				commonAddr === 1 ? (
					<Tag color="processing">默认</Tag>
				) : (
					<Tag color="default">否</Tag>
				),
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
					<Tag color="default">无效</Tag>
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
						onClick={() => openModal("update", record.addrId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该地址吗？"
						onConfirm={() => handleDelete(record.addrId!)}
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
					新增地址
				</Button>
			</div>

			<Table
				rowKey="addrId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 1000 }}
			/>

			<UserAddrModal
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
