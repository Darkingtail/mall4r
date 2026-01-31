import { type Transport, transportApi } from "@/service/api/delivery/transport";
import { App, Button, Input, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import TransportModal, { type TransportModalType } from "./TransportModal";

export default function TransportPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<Transport[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchName, setSearchName] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<TransportModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, transName = "") => {
			setLoading(true);
			try {
				const res = await transportApi.fetchPage({
					current: page,
					size,
					transName,
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

	const handleDelete = async (transportId: number) => {
		try {
			await transportApi.delete(transportId);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize, searchName);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: TransportModalType, transportId?: number) => {
		setModalType(type);
		setEditingId(transportId ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<Transport> = [
		{
			title: "模板名称",
			dataIndex: "transName",
			key: "transName",
			width: 200,
		},
		{
			title: "计费方式",
			dataIndex: "chargeType",
			key: "chargeType",
			width: 100,
			align: "center",
			render: (chargeType) =>
				chargeType === 0 ? (
					<Tag color="blue">按件数</Tag>
				) : (
					<Tag color="green">按重量</Tag>
				),
		},
		{
			title: "是否包邮",
			dataIndex: "isFreeFee",
			key: "isFreeFee",
			width: 100,
			align: "center",
			render: (isFreeFee) =>
				isFreeFee === 1 ? (
					<Tag color="success">包邮</Tag>
				) : (
					<Tag color="default">不包邮</Tag>
				),
		},
		{
			title: "条件包邮",
			dataIndex: "hasFreeCondition",
			key: "hasFreeCondition",
			width: 100,
			align: "center",
			render: (hasFreeCondition, record) =>
				record.isFreeFee === 1 ? (
					<Tag color="default">-</Tag>
				) : hasFreeCondition === 1 ? (
					<Tag color="processing">有条件</Tag>
				) : (
					<Tag color="default">无条件</Tag>
				),
		},
		{
			title: "运费规则数",
			key: "transfeeCount",
			width: 100,
			align: "center",
			render: (_, record) => record.transfees?.length || 0,
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
						onClick={() => openModal("update", record.transportId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该运费模板吗？"
						onConfirm={() => handleDelete(record.transportId!)}
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
						placeholder="模板名称"
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
					新增运费模板
				</Button>
			</div>

			<Table
				rowKey="transportId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 800 }}
			/>

			<TransportModal
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
