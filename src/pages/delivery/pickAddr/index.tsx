import { type PickAddr, pickAddrApi } from "@/service/api/delivery/pickAddr";
import { App, Button, Input, Popconfirm, Space, Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import PickAddrModal, { type PickAddrModalType } from "./PickAddrModal";

export default function PickAddrPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<PickAddr[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchName, setSearchName] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<PickAddrModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, addrName = "") => {
			setLoading(true);
			try {
				const res = await pickAddrApi.fetchPage({
					current: page,
					size,
					addrName,
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

	const handleTableChange = (newPagination: TablePaginationConfig) => {
		fetchDataSource(newPagination.current, newPagination.pageSize, searchName);
	};

	const handleSearch = () => {
		fetchDataSource(1, pagination.pageSize, searchName);
	};

	const handleDelete = async (addrId: number) => {
		try {
			await pickAddrApi.delete(addrId);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize, searchName);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: PickAddrModalType, addrId?: number) => {
		setModalType(type);
		setEditingId(addrId ?? null);
		setModalVisible(true);
	};

	const getFullAddress = (record: PickAddr) => {
		return `${record.province || ""}${record.city || ""}${record.area || ""}${record.addr || ""}`;
	};

	const columns: ColumnsType<PickAddr> = [
		{
			title: "自提点名称",
			dataIndex: "addrName",
			key: "addrName",
			width: 150,
		},
		{
			title: "联系电话",
			dataIndex: "mobile",
			key: "mobile",
			width: 130,
		},
		{
			title: "地址",
			key: "address",
			width: 300,
			ellipsis: true,
			render: (_, record) => getFullAddress(record),
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
						title="确定删除该自提点吗？"
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
			<div className="mb-4 flex items-center justify-between">
				<Space>
					<Input
						placeholder="自提点名称"
						value={searchName}
						onChange={(e) => setSearchName(e.target.value)}
						onPressEnter={handleSearch}
						style={{ width: 200 }}
					/>
					<Button type="primary" onClick={handleSearch}>
						搜索
					</Button>
				</Space>
				<Button type="primary" onClick={() => openModal("add")}>
					新增自提点
				</Button>
			</div>

			<Table
				rowKey="addrId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 800 }}
			/>

			<PickAddrModal
				open={modalVisible}
				type={modalType}
				editingId={editingId}
				onOk={() => {
					setModalVisible(false);
					fetchDataSource(pagination.current, pagination.pageSize, searchName);
				}}
				onCancel={() => setModalVisible(false)}
			/>
		</div>
	);
}
