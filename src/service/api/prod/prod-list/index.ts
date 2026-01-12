import { type HttpClient, httpClient } from "@/service";

export interface ProdListItem {
	prodId: number;
	prodName: string;
	oriPrice: number;
	price: number;
	totalStocks: number;
	pic: string;
	status: number; // 0: 下架, 1: 上架
	imgs?: string; // 逗号分隔的图片列表
}

export type ProdList = ProdListItem[];

export interface FetchProdListPageRequestPayload {
	prodName?: string;
	status?: number;
	current: number;
	size: number;
}

export interface FetchProdListPageResponse {
	current: number;
	pages: number;
	records: ProdList;
	size: number;
	total: number;
}

export interface SkuItem {
	skuId?: number;
	prodId?: number;
	properties?: string;
	oriPrice: number;
	price: number;
	stocks: number;
	actualStocks?: number;
	pic?: string;
	skuName?: string;
	prodName?: string;
	status?: number;
}

export interface DeliveryModeVo {
	hasShopDelivery?: boolean;
	hasUserPickUp?: boolean;
}

export interface ProductDetail {
	prodId?: number;
	prodName: string;
	brief?: string;
	pic?: string;
	imgs?: string;
	categoryId?: number;
	tagList?: number[];
	price: number;
	oriPrice: number;
	totalStocks: number;
	status?: number;
	deliveryMode?: string;
	deliveryModeVo?: DeliveryModeVo;
	skuList?: SkuItem[];
	content?: string;
}

const PROD_LIST_BASE_PATH = "/prod/prod";
const PAGE = `${PROD_LIST_BASE_PATH}/page`;

export function createProdListApi(client: HttpClient = httpClient) {
	return {
		fetchProdListPage<T = FetchProdListPageResponse>(
			params: FetchProdListPageRequestPayload,
		): Promise<T> {
			const urlParams = Object.entries(params)
				.map(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						return "";
					}
					return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
				})
				.filter(Boolean)
				.join("&");

			const url = urlParams ? `${PAGE}?${urlParams}` : PAGE;
			return client.get<T, T>(url);
		},
		// 获取商品详情
		info(prodId: number): Promise<ProductDetail> {
			return client.get<ProductDetail, ProductDetail>(
				`${PROD_LIST_BASE_PATH}/info/${prodId}`,
			);
		},
		// 新增商品
		add(data: ProductDetail): Promise<void> {
			return client.post(PROD_LIST_BASE_PATH, data);
		},
		// 更新商品
		update(data: ProductDetail): Promise<void> {
			return client.put(PROD_LIST_BASE_PATH, data);
		},
		// 删除商品（批量）
		deleteProd(prodIds: number[]): Promise<void> {
			return client.delete(PROD_LIST_BASE_PATH, { data: prodIds });
		},
		// 删除单个商品
		delete(prodId: number): Promise<void> {
			return client.delete(PROD_LIST_BASE_PATH, { data: [prodId] });
		},
		// 更新商品状态
		updateProdStatus(prodId: number, status: number): Promise<void> {
			return client.put(`${PROD_LIST_BASE_PATH}/prodStatus`, {
				prodId,
				status,
			});
		},
	};
}

export const prodListApi = createProdListApi();