import { type HttpClient, httpClient } from "@/service";

export interface IndexImg {
	imgId?: number;
	imgUrl: string;
	des?: string;
	title?: string;
	link?: string;
	status: number; // 0:禁用 1:启用
	seq: number;
	uploadTime?: string;
	type?: number; // 0:关联商品
	relation?: number; // 关联ID
	pic?: string; // 商品图片（关联）
	prodName?: string; // 商品名称（关联）
}

export interface FetchIndexImgPageRequest {
	current: number;
	size: number;
	status?: number;
}

export interface FetchIndexImgPageResponse {
	current: number;
	pages: number;
	records: IndexImg[];
	size: number;
	total: number;
}

const INDEX_IMG_BASE_PATH = "/admin/indexImg";

export function createIndexImgApi(client: HttpClient = httpClient) {
	return {
		// 分页获取轮播图列表
		fetchPage(
			params: FetchIndexImgPageRequest,
		): Promise<FetchIndexImgPageResponse> {
			const urlParams = Object.entries(params)
				.map(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						return "";
					}
					return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
				})
				.filter(Boolean)
				.join("&");

			const url = urlParams
				? `${INDEX_IMG_BASE_PATH}/page?${urlParams}`
				: `${INDEX_IMG_BASE_PATH}/page`;
			return client.get<FetchIndexImgPageResponse, FetchIndexImgPageResponse>(
				url,
			);
		},
		// 获取轮播图详情
		getById(imgId: number): Promise<IndexImg> {
			return client.get<IndexImg, IndexImg>(
				`${INDEX_IMG_BASE_PATH}/info/${imgId}`,
			);
		},
		// 新增轮播图
		add(data: IndexImg): Promise<void> {
			return client.post(INDEX_IMG_BASE_PATH, data);
		},
		// 更新轮播图
		update(data: IndexImg): Promise<void> {
			return client.put(INDEX_IMG_BASE_PATH, data);
		},
		// 删除轮播图（批量）
		delete(imgIds: number[]): Promise<void> {
			return client.delete(INDEX_IMG_BASE_PATH, { data: imgIds });
		},
	};
}

export const indexImgApi = createIndexImgApi();
