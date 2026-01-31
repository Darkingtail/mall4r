import { transportApi, type Transport, type Transfee, type TransfeeFree } from "@/service/api/delivery/transport";
import { areaApi } from "@/service/api/delivery/area";
import {
	App,
	Button,
	Cascader,
	Form,
	Input,
	InputNumber,
	Modal,
	Radio,
	Space,
	Table,
	Divider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

export type TransportModalType = "add" | "update";

interface TransportModalProps {
	open: boolean;
	type: TransportModalType;
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

export default function TransportModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: TransportModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
	const [transfees, setTransfees] = useState<Transfee[]>([]);
	const [transfeeFrees, setTransfeeFrees] = useState<TransfeeFree[]>([]);
	const [isFreeFee, setIsFreeFee] = useState(0);
	const [hasFreeCondition, setHasFreeCondition] = useState(0);
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
				transportApi
					.getById(editingId)
					.then((data) => {
						form.setFieldsValue({
							transName: data.transName,
							chargeType: data.chargeType,
							isFreeFee: data.isFreeFee,
							hasFreeCondition: data.hasFreeCondition,
						});
						setIsFreeFee(data.isFreeFee);
						setHasFreeCondition(data.hasFreeCondition);
						setTransfees(data.transfees || []);
						setTransfeeFrees(data.transfeeFrees || []);
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
				form.setFieldsValue({ chargeType: 0, isFreeFee: 0, hasFreeCondition: 0 });
				setIsFreeFee(0);
				setHasFreeCondition(0);
				setTransfees([]);
				setTransfeeFrees([]);
			}
		}
	}, [open, type, editingId, form]);

	const loadAreaData = async (selectedOptions: AreaOption[]) => {
		const targetOption = selectedOptions[selectedOptions.length - 1];
		const children = await areaApi.listByPid(targetOption.value);

		targetOption.children = children.map((area) => ({
			value: area.areaId!,
			label: area.areaName,
			isLeaf: area.level >= 2, // 只到市级
		}));
		setAreaOptions([...areaOptions]);
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			const submitData: Transport = {
				transName: values.transName,
				chargeType: values.chargeType,
				isFreeFee: values.isFreeFee,
				hasFreeCondition: values.hasFreeCondition,
				transfees: values.isFreeFee === 0 ? transfees : [],
				transfeeFrees: values.hasFreeCondition === 1 ? transfeeFrees : [],
			};

			if (type === "add") {
				await transportApi.add(submitData);
				message.success("新增成功");
			} else {
				await transportApi.update({ ...submitData, transportId: editingId! });
				message.success("更新成功");
			}

			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const addTransfee = () => {
		setTransfees([
			...transfees,
			{
				cityId: undefined,
				city: "",
				firstPiece: 1,
				firstFee: 0,
				continuousPiece: 1,
				continuousFee: 0,
			},
		]);
	};

	const updateTransfee = (index: number, field: keyof Transfee, value: any) => {
		const newTransfees = [...transfees];
		(newTransfees[index] as any)[field] = value;
		setTransfees(newTransfees);
	};

	const removeTransfee = (index: number) => {
		setTransfees(transfees.filter((_, i) => i !== index));
	};

	const addTransfeeFree = () => {
		setTransfeeFrees([
			...transfeeFrees,
			{
				freeType: 0,
				amount: 0,
				piece: 0,
				cityId: undefined,
				city: "",
			},
		]);
	};

	const updateTransfeeFree = (index: number, field: keyof TransfeeFree, value: any) => {
		const newTransfeeFrees = [...transfeeFrees];
		(newTransfeeFrees[index] as any)[field] = value;
		setTransfeeFrees(newTransfeeFrees);
	};

	const removeTransfeeFree = (index: number) => {
		setTransfeeFrees(transfeeFrees.filter((_, i) => i !== index));
	};

	const transfeeColumns: ColumnsType<Transfee> = [
		{
			title: "配送地区",
			dataIndex: "city",
			key: "city",
			width: 150,
			render: (_, record, index) => (
				<Cascader
					options={areaOptions}
					loadData={loadAreaData as any}
					placeholder="选择地区"
					changeOnSelect
					style={{ width: 140 }}
					onChange={(_, selectedOptions) => {
						if (selectedOptions && selectedOptions.length > 0) {
							const lastOption = selectedOptions[selectedOptions.length - 1];
							updateTransfee(index, "cityId", lastOption.value as number);
							updateTransfee(index, "city", lastOption.label as string);
						}
					}}
					value={record.cityId ? [record.cityId] : undefined}
				/>
			),
		},
		{
			title: "首件(个)",
			dataIndex: "firstPiece",
			key: "firstPiece",
			width: 100,
			render: (val, _, index) => (
				<InputNumber
					min={1}
					value={val}
					onChange={(v) => updateTransfee(index, "firstPiece", v || 1)}
					style={{ width: 80 }}
				/>
			),
		},
		{
			title: "首费(元)",
			dataIndex: "firstFee",
			key: "firstFee",
			width: 100,
			render: (val, _, index) => (
				<InputNumber
					min={0}
					precision={2}
					value={val}
					onChange={(v) => updateTransfee(index, "firstFee", v || 0)}
					style={{ width: 80 }}
				/>
			),
		},
		{
			title: "续件(个)",
			dataIndex: "continuousPiece",
			key: "continuousPiece",
			width: 100,
			render: (val, _, index) => (
				<InputNumber
					min={1}
					value={val}
					onChange={(v) => updateTransfee(index, "continuousPiece", v || 1)}
					style={{ width: 80 }}
				/>
			),
		},
		{
			title: "续费(元)",
			dataIndex: "continuousFee",
			key: "continuousFee",
			width: 100,
			render: (val, _, index) => (
				<InputNumber
					min={0}
					precision={2}
					value={val}
					onChange={(v) => updateTransfee(index, "continuousFee", v || 0)}
					style={{ width: 80 }}
				/>
			),
		},
		{
			title: "操作",
			key: "action",
			width: 60,
			render: (_, __, index) => (
				<Button
					type="link"
					danger
					icon={<DeleteOutlined />}
					onClick={() => removeTransfee(index)}
				/>
			),
		},
	];

	const transfeeFreeColumns: ColumnsType<TransfeeFree> = [
		{
			title: "配送地区",
			dataIndex: "city",
			key: "city",
			width: 150,
			render: (_, record, index) => (
				<Cascader
					options={areaOptions}
					loadData={loadAreaData as any}
					placeholder="选择地区"
					changeOnSelect
					style={{ width: 140 }}
					onChange={(_, selectedOptions) => {
						if (selectedOptions && selectedOptions.length > 0) {
							const lastOption = selectedOptions[selectedOptions.length - 1];
							updateTransfeeFree(index, "cityId", lastOption.value as number);
							updateTransfeeFree(index, "city", lastOption.label as string);
						}
					}}
					value={record.cityId ? [record.cityId] : undefined}
				/>
			),
		},
		{
			title: "包邮方式",
			dataIndex: "freeType",
			key: "freeType",
			width: 130,
			render: (val, _, index) => (
				<Radio.Group
					value={val}
					onChange={(e) => updateTransfeeFree(index, "freeType", e.target.value)}
					size="small"
				>
					<Radio value={0}>按件数</Radio>
					<Radio value={1}>按金额</Radio>
				</Radio.Group>
			),
		},
		{
			title: "件数",
			dataIndex: "piece",
			key: "piece",
			width: 100,
			render: (val, record, index) => (
				<InputNumber
					min={0}
					value={val}
					onChange={(v) => updateTransfeeFree(index, "piece", v || 0)}
					style={{ width: 80 }}
					disabled={record.freeType === 1}
				/>
			),
		},
		{
			title: "金额(元)",
			dataIndex: "amount",
			key: "amount",
			width: 100,
			render: (val, record, index) => (
				<InputNumber
					min={0}
					precision={2}
					value={val}
					onChange={(v) => updateTransfeeFree(index, "amount", v || 0)}
					style={{ width: 80 }}
					disabled={record.freeType === 0}
				/>
			),
		},
		{
			title: "操作",
			key: "action",
			width: 60,
			render: (_, __, index) => (
				<Button
					type="link"
					danger
					icon={<DeleteOutlined />}
					onClick={() => removeTransfeeFree(index)}
				/>
			),
		},
	];

	return (
		<Modal
			title={type === "add" ? "新增运费模板" : "编辑运费模板"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={800}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 19 }}
				disabled={fetching}
			>
				<Form.Item
					name="transName"
					label="模板名称"
					rules={[{ required: true, message: "请输入模板名称" }]}
				>
					<Input placeholder="请输入模板名称" maxLength={50} />
				</Form.Item>

				<Form.Item name="chargeType" label="计费方式">
					<Radio.Group>
						<Radio value={0}>按件数</Radio>
						<Radio value={1}>按重量</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item name="isFreeFee" label="是否包邮">
					<Radio.Group onChange={(e) => setIsFreeFee(e.target.value)}>
						<Radio value={1}>包邮</Radio>
						<Radio value={0}>不包邮</Radio>
					</Radio.Group>
				</Form.Item>

				{isFreeFee === 0 && (
					<>
						<Divider plain>
							运费配置
						</Divider>
						<div className="mb-4">
							<Space className="mb-2">
								<Button type="dashed" icon={<PlusOutlined />} onClick={addTransfee}>
									添加运费规则
								</Button>
							</Space>
							<Table
								rowKey={(_, index) => `transfee-${index}`}
								columns={transfeeColumns}
								dataSource={transfees}
								pagination={false}
								size="small"
								scroll={{ x: 600 }}
							/>
						</div>

						<Form.Item name="hasFreeCondition" label="条件包邮">
							<Radio.Group onChange={(e) => setHasFreeCondition(e.target.value)}>
								<Radio value={0}>无条件</Radio>
								<Radio value={1}>有条件</Radio>
							</Radio.Group>
						</Form.Item>

						{hasFreeCondition === 1 && (
							<>
								<Divider plain>包邮条件</Divider>
								<div className="mb-4">
									<Space className="mb-2">
										<Button
											type="dashed"
											icon={<PlusOutlined />}
											onClick={addTransfeeFree}
										>
											添加包邮条件
										</Button>
									</Space>
									<Table
										rowKey={(_, index) => `transfeeFree-${index}`}
										columns={transfeeFreeColumns}
										dataSource={transfeeFrees}
										pagination={false}
										size="small"
										scroll={{ x: 500 }}
									/>
								</div>
							</>
						)}
					</>
				)}
			</Form>
		</Modal>
	);
}
