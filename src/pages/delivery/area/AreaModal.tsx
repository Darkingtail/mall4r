import { areaApi, type Area } from "@/service/api/delivery/area";
import { App, Cascader, Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";

export type AreaModalType = "add" | "update";

interface AreaModalProps {
	open: boolean;
	type: AreaModalType;
	editingId?: number | null;
	parentArea?: Area | null;
	onOk: () => void;
	onCancel: () => void;
}

interface AreaOption {
	value: number;
	label: string;
	isLeaf: boolean;
	children?: AreaOption[];
}

export default function AreaModal({
	open,
	type,
	editingId,
	parentArea,
	onOk,
	onCancel,
}: AreaModalProps) {
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
					isLeaf: area.level >= 3,
				})),
			);
		});
	}, []);

	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				areaApi
					.getById(editingId)
					.then((data) => {
						form.setFieldsValue({
							areaName: data.areaName,
						});
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
				// 如果有父级区域，设置默认值
				if (parentArea) {
					form.setFieldsValue({
						parentId: [parentArea.areaId],
					});
				}
			}
		}
	}, [open, type, editingId, parentArea, form]);

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

			let parentId = 0;
			let level = 1;

			if (values.parentId && values.parentId.length > 0) {
				parentId = values.parentId[values.parentId.length - 1];
				level = values.parentId.length + 1;
			}

			const submitData = {
				areaName: values.areaName,
				parentId,
				level,
			};

			if (type === "add") {
				await areaApi.add(submitData);
				message.success("新增成功");
			} else {
				await areaApi.update({ ...submitData, areaId: editingId! });
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
			title={type === "add" ? "新增区域" : "编辑区域"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={500}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 18 }}
				disabled={fetching}
			>
				{type === "add" && (
					<Form.Item name="parentId" label="上级区域">
						<Cascader
							options={areaOptions}
							loadData={loadAreaData as any}
							placeholder="不选择则为省级区域"
							changeOnSelect
						/>
					</Form.Item>
				)}

				<Form.Item
					name="areaName"
					label="区域名称"
					rules={[{ required: true, message: "请输入区域名称" }]}
				>
					<Input placeholder="请输入区域名称" maxLength={50} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
