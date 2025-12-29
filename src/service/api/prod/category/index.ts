import { type HttpClient, httpClient } from "@/service";

export interface Category {
	categoryId: number;
	categoryName: string;
	parentId?: number;
	grade?: number;
	shopId?: number;
	seq?: number;
	status?: number;
	categories?: Category[]; // 注意：后端返回的字段是 categories，不是 children
}

const CATEGORY_BASE_PATH = "/prod/category";

export function createCategoryApi(client: HttpClient = httpClient) {
	return {
		// 获取所有分类（树形结构，最多2级）
		listCategory(): Promise<Category[]> {
			return client.get<Category[], Category[]>(`${CATEGORY_BASE_PATH}/listCategory`);
		},
		// 获取产品分类树（用于级联选择器）
		listProdCategory(): Promise<Category[]> {
			return client.get<Category[], Category[]>(`${CATEGORY_BASE_PATH}/listProdCategory`);
		},
	};
}

export const categoryApi = createCategoryApi();
