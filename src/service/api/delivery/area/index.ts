import { type HttpClient, httpClient } from "@/service";

export interface Area {
	areaId?: number;
	areaName: string;
	parentId: number;
	level: number;
	areas?: Area[];
}

export interface FetchAreaPageRequest {
	current: number;
	size: number;
	areaName?: string;
}

export interface FetchAreaPageResponse {
	current: number;
	pages: number;
	records: Area[];
	size: number;
	total: number;
}

const AREA_BASE_PATH = "/admin/area";

export function createAreaApi(client: HttpClient = httpClient) {
	return {
		fetchPage(params: FetchAreaPageRequest): Promise<FetchAreaPageResponse> {
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
				? `${AREA_BASE_PATH}/page?${urlParams}`
				: `${AREA_BASE_PATH}/page`;
			return client.get<FetchAreaPageResponse, FetchAreaPageResponse>(url);
		},
		list(): Promise<Area[]> {
			return client.get<Area[], Area[]>(`${AREA_BASE_PATH}/list`);
		},
		listByPid(pid: number): Promise<Area[]> {
			return client.get<Area[], Area[]>(`${AREA_BASE_PATH}/listByPid?pid=${pid}`);
		},
		getById(areaId: number): Promise<Area> {
			return client.get<Area, Area>(`${AREA_BASE_PATH}/info/${areaId}`);
		},
		add(data: Area): Promise<void> {
			return client.post(AREA_BASE_PATH, data);
		},
		update(data: Area): Promise<void> {
			return client.put(AREA_BASE_PATH, data);
		},
		delete(areaId: number): Promise<void> {
			return client.delete(`${AREA_BASE_PATH}/${areaId}`);
		},
	};
}

export const areaApi = createAreaApi();
