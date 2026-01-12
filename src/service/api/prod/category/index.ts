import { type HttpClient, httpClient } from "@/service";

export interface Category {
	categoryId: number;
	categoryName: string;
	parentId?: number;
	grade?: number;
	shopId?: number;
	seq?: number;
	status?: number;
	pic?: string;
	categories?: Category[]; // 注意：后端返回的字段是 categories，不是 children
}

export interface CategoryFormData {
	categoryId?: number;
	categoryName: string;
	parentId?: number;
	grade?: number;
	seq?: number;
	status?: number;
	pic?: string;
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
		// 获取分类表格数据（树形）
		getTableData(): Promise<Category[]> {
			return client.get<Category[], Category[]>(`${CATEGORY_BASE_PATH}/table`);
		},
		// 获取分类详情
		getInfo(categoryId: number): Promise<Category> {
			return client.get<Category, Category>(`${CATEGORY_BASE_PATH}/info/${categoryId}`);
		},
		// 新增分类
		add(data: CategoryFormData): Promise<void> {
			return client.post(`${CATEGORY_BASE_PATH}`, data);
		},
		// 更新分类
		update(data: CategoryFormData): Promise<void> {
			return client.put(`${CATEGORY_BASE_PATH}`, data);
		},
		// 删除分类
		delete(categoryId: number): Promise<void> {
			return client.delete(`${CATEGORY_BASE_PATH}/${categoryId}`);
		},
	};
}

export const categoryApi = createCategoryApi();
