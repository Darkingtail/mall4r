import {
	createProdListApi,
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

	const fetchProdList = (values: FetchProdListPageRequestPayload) => {
		const { fetchProdListPage } = createProdListApi();
		fetchProdListPage({
			...values,
		}).then((res) => {
			setDataSource(res.records);
			setTotal(res.total);
			console.log("Fetched product list:", res);
		});
	};
	const onSearch = (values: FormValues) => {
		fetchProdList({ ...values, t: Date.now() });
	};
	const onSearchReset = (values: FormValues) => {
		fetchProdList({ ...values, t: Date.now() });
	};
	useEffect(() => {
		fetchProdList({ current, size, t: Date.now() });
	}, [current, size]);

	return (
		<>
			<SearchForm onSearch={onSearch} onReset={onSearchReset} />
			<Table
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
