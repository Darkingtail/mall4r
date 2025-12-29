import { type HttpClient, httpClient } from "@/service";

export interface ProdTag {
	id: number;
	title: string;
	status?: number;
	seq?: number;
	shopId?: number;
	prodCount?: number;
}

const TAG_BASE_PATH = "/prod/prodTag";

export function createProdTagApi(client: HttpClient = httpClient) {
	return {
		// 获取所有标签列表
		listTagList(): Promise<ProdTag[]> {
			return client.get<ProdTag[], ProdTag[]>(`${TAG_BASE_PATH}/listTagList`);
		},
	};
}

export const prodTagApi = createProdTagApi();
