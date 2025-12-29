import { type HttpClient, httpClient } from "@/service";

export interface ProdListItem {
	prodId?: number;
	prodName: string;
	oriPrice?: number;
	price?: number;
	totalStocks?: number;
	pic?: string;
	status?: number;
}

export type ProdList = ProdListItem[];

// 配送方式
export interface DeliveryMode {
	hasUserPickUp?: boolean; // 用户自提
	hasShopDelivery?: boolean; // 店铺配送
}

// SKU
export interface Sku {
	skuId?: number;
	prodId?: number;
	properties?: string; // 销售属性组合字符串,格式是p1:v1;p2:v2
	oriPrice?: number; // 原价
	price?: number; // 价格
	stocks?: number; // 库存
	actualStocks?: number; // 实际库存
	partyCode?: string; // 商家编码
	modelId?: string; // 商品条形码
	pic?: string; // sku图片
	skuName?: string; // sku名称
	prodName?: string; // 商品名称
	weight?: number; // 重量
	volume?: number; // 体积
	status?: number; // 状态：0禁用 1 启用
}

// 商品详情（用于新增和编辑）
export interface ProductDetail {
	prodId?: number;
	prodName: string;
	price?: number; // 商品价格（从SKU计算）
	oriPrice?: number; // 商品原价（从SKU计算）
	totalStocks?: number; // 库存量（从SKU计算）
	brief?: string; // 简要描述/卖点
	pic: string; // 商品主图
	imgs: string; // 商品图片（逗号分隔）
	categoryId: number; // 商品分类
	tagList: number[]; // 分组标签列表
	status?: number; // 状态（1上架/0下架）
	deliveryMode?: string; // 配送方式（JSON字符串，后端存储格式）
	deliveryModeVo?: DeliveryMode; // 配送方式对象（前端使用）
	deliveryTemplateId?: number; // 运费模板ID
	skuList?: Sku[]; // SKU列表
	content?: string; // 产品详情（富文本）
}

// 新增商品参数（不包含 prodId）
export type AddProductParams = Omit<ProductDetail, "prodId">;

export interface FetchProdListPageRequestPayload {
	t: number;
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
			return client.get<ProductDetail, ProductDetail>(`${PROD_LIST_BASE_PATH}/info/${prodId}`);
		},
		// 新增商品
		add(product: AddProductParams): Promise<void> {
			return client.post<void, void>(PROD_LIST_BASE_PATH, product);
		},
		// 更新商品
		update(product: ProductDetail): Promise<void> {
			return client.put<void, void>(PROD_LIST_BASE_PATH, product);
		},
		// 删除商品
		delete(id: number): Promise<void> {
			return client.delete<void, void>(`${PROD_LIST_BASE_PATH}`, { data: [id] });
		},
		// 批量删除商品
		batchDelete(ids: number[]): Promise<void> {
			return client.delete<void, void>(`${PROD_LIST_BASE_PATH}`, { data: ids });
		},
	};
}

export const prodListApi = createProdListApi();
