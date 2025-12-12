import {
	prodListApi,
	type FetchProdListPageRequestPayload,
	type ProdListItem,
} from "@/service/api/prod/prod-list";
import { useEffect, useState } from "react";
import type { FormValues } from "./search-form";
import SearchForm from "./search-form";
import Table from "./search-table";

export default function ProdList() {
	const [dataSource, setDataSource] = useState<ProdListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [current, setCurrent] = useState(1);
	const [size, setSize] = useState(10);
	const [loading, setLoading] = useState(false);
	const [searchParams, setSearchParams] = useState<FormValues>({});

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

	useEffect(() => {
		fetchProdList({ ...searchParams, current, size, t: Date.now() });
	}, [current, size, searchParams]);

	return (
		<>
			<SearchForm onSearch={onSearch} onReset={onSearchReset} />
			<Table
				loading={loading}
				dataSource={dataSource}
				total={total}
				current={current}
				size={size}
				onPaginationChange={setCurrent}
				onPageSizeChange={setSize}
			/>
		</>
	);
}
