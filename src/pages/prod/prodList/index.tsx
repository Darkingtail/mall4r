import {
	createProdListApi,
	type FetchProdListPageRequestPayload,
} from "@/service/api/prod/prod-list";
import type { FormValues } from "./search-form";
import SearchForm from "./search-form";
import Table from "./search-table";

export default function ProdList() {
	const fetchProdList = (values: FetchProdListPageRequestPayload) => {
		const { fetchProdListPage } = createProdListApi();
		fetchProdListPage({
			t: Date.now(),
			prodName: "Apple iPhone XS Max 移动联通电信",
		}).then((res) => {
			console.log("Fetched product list:", res);
		});
	};
	const onSearch = (values: FormValues) => {
		console.log("Search values:", values);
		fetchProdList(values);
	};

	return (
		<>
			<SearchForm onSearch={onSearch} />
			<Table />
		</>
	);
}
