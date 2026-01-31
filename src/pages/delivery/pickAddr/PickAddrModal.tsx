import { pickAddrApi } from "@/service/api/delivery/pickAddr";
import { areaApi } from "@/service/api/delivery/area";
import { App, Cascader, Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";

export type PickAddrModalType = "add" | "update";

interface PickAddrModalProps {
	open: boolean;
	type: PickAddrModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

interface AreaOption {
	value: number;
	label: string;
	isLeaf: boolean;
	children?: AreaOption[];
}

export default function PickAddrModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: PickAddrModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
	const { message } = App.useApp();

	// 加载省份列表
	useEffect(() => {
		areaApi.listByPid(0).then((areas) => {
			setAreaOptions(
				areas.map((area) => ({
					value: area.areaId!,
					label: area.areaName,
					isLeaf: false,
				})),
			);
		});
	}, []);

	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				pickAddrApi
					.getById(editingId)
					.then(async (data) => {
						// 需要加载已选择的省市区
						if (data.provinceId && data.cityId && data.areaId) {
							const [cities, areas] = await Promise.all([
								areaApi.listByPid(data.provinceId),
								areaApi.listByPid(data.cityId),
							]);

							setAreaOptions((prev) =>
								prev.map((province) => {
									if (province.value === data.provinceId) {
										return {
											...province,
											children: cities.map((city) => ({
												value: city.areaId!,
												label: city.areaName,
												isLeaf: false,
												children:
													city.areaId === data.cityId
														? areas.map((area) => ({
																value: area.areaId!,
																label: area.areaName,
																isLeaf: true,
															}))
														: undefined,
											})),
										};
									}
									return province;
								}),
							);
						}
						form.setFieldsValue({
							...data,
							areaIds: [data.provinceId, data.cityId, data.areaId],
						});
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
			}
		}
	}, [open, type, editingId, form]);

	const loadAreaData = async (selectedOptions: AreaOption[]) => {
		const targetOption = selectedOptions[selectedOptions.length - 1];
		const children = await areaApi.listByPid(targetOption.value);

		targetOption.children = children.map((area) => ({
			value: area.areaId!,
			label: area.areaName,
			isLeaf: area.level >= 3,
		}));
		setAreaOptions([...areaOptions]);
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			const [provinceId, cityId, areaId] = values.areaIds || [];

			// 获取选中的省市区名称
			const findAreaName = (
				options: AreaOption[],
				ids: number[],
			): string[] => {
				const names: string[] = [];
				let currentOptions = options;
				for (const id of ids) {
					const found = currentOptions.find((opt) => opt.value === id);
					if (found) {
						names.push(found.label);
						currentOptions = found.children || [];
					}
				}
				return names;
			};

			const [province, city, area] = findAreaName(areaOptions, values.areaIds);

			const submitData = {
				addrName: values.addrName,
				addr: values.addr,
				mobile: values.mobile,
				province,
				city,
				area,
				provinceId,
				cityId,
				areaId,
			};

			if (type === "add") {
				await pickAddrApi.add(submitData);
				message.success("新增成功");
			} else {
				await pickAddrApi.update({ ...submitData, addrId: editingId! });
				message.success("更新成功");
			}

			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={type === "add" ? "新增自提点" : "编辑自提点"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={550}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 18 }}
				disabled={fetching}
			>
				<Form.Item
					name="addrName"
					label="自提点名称"
					rules={[{ required: true, message: "请输入自提点名称" }]}
				>
					<Input placeholder="请输入自提点名称" maxLength={100} />
				</Form.Item>

				<Form.Item
					name="mobile"
					label="联系电话"
					rules={[{ required: true, message: "请输入联系电话" }]}
				>
					<Input placeholder="请输入联系电话" maxLength={20} />
				</Form.Item>

				<Form.Item
					name="areaIds"
					label="所在地区"
					rules={[{ required: true, message: "请选择所在地区" }]}
				>
					<Cascader
						options={areaOptions}
						loadData={loadAreaData as any}
						placeholder="请选择省/市/区"
						changeOnSelect
					/>
				</Form.Item>

				<Form.Item
					name="addr"
					label="详细地址"
					rules={[{ required: true, message: "请输入详细地址" }]}
				>
					<Input.TextArea rows={2} placeholder="请输入详细地址" maxLength={200} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
