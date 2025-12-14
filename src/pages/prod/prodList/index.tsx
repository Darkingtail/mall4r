import {
	createProdListApi,
	prodListApi,
	type FetchProdListPageRequestPayload,
	type ProdListItem,
} from "@/service/api/prod/prod-list";
import { Button, message, Modal, Space } from "antd";
import { useEffect, useState } from "react";
import DetailModal from "./detail-modal";
import type { FormValues } from "./search-form";
import SearchForm from "./search-form";
import SearchTable from "./search-table";

export default function ProdList() {
	const [dataSource, setDataSource] = useState<ProdListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [current, setCurrent] = useState(1);
	const [size, setSize] = useState(10);
	const [loading, setLoading] = useState(false);
	const [searchParams, setSearchParams] = useState<FormValues>({});
	// 详情Modal显示状态
	const [isModalOpen, setIsModalOpen] = useState(false);
	// 选中的行key
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const fetchProdList = (values: FetchProdListPageRequestPayload) => {
		setLoading(true);
		prodListApi
			.fetchProdListPage(values)
			.then((res) => {
				setDataSource(res.records);
				setTotal(res.total);
			})
			.finally(() => setLoading(false));
	};

	const onSearch = (values: FormValues) => {
		setSearchParams(values);
		setCurrent(1); // 搜索时重置到第一页
	};

	const onSearchReset = (values: FormValues) => {
		setSearchParams(values);
		setCurrent(1);
	};

	const handleBatchDelete = () => {
		if (!selectedRowKeys.length) {
			message.error("请至少选择一条数据");
			return;
		}
		const { batchDelete } = createProdListApi();
		Modal.confirm({
			title: "警告",
			content: "确定要删除这些数据吗？",
			okType: "danger",
			okText: "确定",
			cancelText: "取消",
			onOk() {
				batchDelete(selectedRowKeys as number[]).then(() => {
					message.success("删除成功");
					setSelectedRowKeys([]);
					fetchProdList({ ...searchParams, current, size, t: Date.now() });
				});
			},
		});
	};

	const handleRefresh = () => {
		fetchProdList({ ...searchParams, current, size, t: Date.now() });
	};

	useEffect(() => {
		fetchProdList({ ...searchParams, current, size, t: Date.now() });
	}, [current, size, searchParams]);

	return (
		<>
			<Space direction="vertical" size="middle" style={{ display: "flex" }}>
				<SearchForm onSearch={onSearch} onReset={onSearchReset} />
				<Space>
					<Button type="primary" onClick={() => setIsModalOpen(true)}>
						新增
					</Button>
					<Button type="primary" onClick={() => handleBatchDelete()}>
						批量删除
					</Button>
				</Space>
				<SearchTable
					loading={loading}
					dataSource={dataSource}
					total={total}
					current={current}
					size={size}
					onPaginationChange={setCurrent}
					onPageSizeChange={setSize}
					onSelectionChange={setSelectedRowKeys}
					onRefresh={handleRefresh}
				/>
			</Space>
			<DetailModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
		</>
	);
}
