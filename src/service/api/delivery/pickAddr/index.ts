import { type HttpClient, httpClient } from "@/service";

export interface PickAddr {
	addrId?: number;
	addrName: string;
	addr: string;
	mobile: string;
	province: string;
	city: string;
	area: string;
	provinceId?: number;
	cityId?: number;
	areaId?: number;
}

export interface FetchPickAddrPageRequest {
	current: number;
	size: number;
	addrName?: string;
}

export interface FetchPickAddrPageResponse {
	current: number;
	pages: number;
	records: PickAddr[];
	size: number;
	total: number;
}

const PICK_ADDR_BASE_PATH = "/shop/pickAddr";

export function createPickAddrApi(client: HttpClient = httpClient) {
	return {
		fetchPage(
			params: FetchPickAddrPageRequest,
		): Promise<FetchPickAddrPageResponse> {
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
				? `${PICK_ADDR_BASE_PATH}/page?${urlParams}`
				: `${PICK_ADDR_BASE_PATH}/page`;
			return client.get<FetchPickAddrPageResponse, FetchPickAddrPageResponse>(
				url,
			);
		},
		getById(addrId: number): Promise<PickAddr> {
			return client.get<PickAddr, PickAddr>(
				`${PICK_ADDR_BASE_PATH}/info/${addrId}`,
			);
		},
		add(data: PickAddr): Promise<void> {
			return client.post(PICK_ADDR_BASE_PATH, data);
		},
		update(data: PickAddr): Promise<void> {
			return client.put(PICK_ADDR_BASE_PATH, data);
		},
		delete(addrId: number): Promise<void> {
			return client.delete(`${PICK_ADDR_BASE_PATH}/${addrId}`);
		},
	};
}

export const pickAddrApi = createPickAddrApi();
