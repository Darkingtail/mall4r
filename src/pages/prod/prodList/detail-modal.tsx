import { PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Cascader,
	Checkbox,
	ColorPicker,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Mentions,
	Modal,
	Radio,
	Rate,
	Select,
	Slider,
	Switch,
	TreeSelect,
	Upload,
} from "antd";

export default function DetailModal({
	isModalOpen,
	setIsModalOpen,
}: {
	isModalOpen: boolean;
	setIsModalOpen: (open: boolean) => void;
}) {
	const handleOk = () => {
		setIsModalOpen(false);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	};
	return (
		<Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
			<Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} layout="horizontal">
				<Form.Item label="Checkbox" name="disabled" valuePropName="checked">
					<Checkbox>Checkbox</Checkbox>
				</Form.Item>
				<Form.Item label="Radio">
					<Radio.Group>
						<Radio value="apple"> Apple </Radio>
						<Radio value="pear"> Pear </Radio>
					</Radio.Group>
				</Form.Item>
				<Form.Item label="Input">
					<Input />
				</Form.Item>
				<Form.Item label="Select">
					<Select options={[{ label: "Demo", value: "demo" }]} />
				</Form.Item>
				<Form.Item label="TreeSelect">
					<TreeSelect
						treeData={[
							{ title: "Light", value: "light", children: [{ title: "Bamboo", value: "bamboo" }] },
						]}
					/>
				</Form.Item>
				<Form.Item label="Cascader">
					<Cascader
						options={[
							{
								value: "zhejiang",
								label: "Zhejiang",
								children: [
									{
										value: "hangzhou",
										label: "Hangzhou",
									},
								],
							},
						]}
					/>
				</Form.Item>
				<Form.Item label="DatePicker">
					<DatePicker />
				</Form.Item>
				<Form.Item label="InputNumber">
					<InputNumber />
				</Form.Item>
				<Form.Item label="TextArea"></Form.Item>
				<Form.Item label="Switch" valuePropName="checked">
					<Switch />
				</Form.Item>
				<Form.Item label="Upload" valuePropName="fileList">
					<Upload action="/upload.do" listType="picture-card">
						<button
							style={{ color: "inherit", cursor: "inherit", border: 0, background: "none" }}
							type="button"
						>
							<PlusOutlined />
							<div style={{ marginTop: 8 }}>Upload</div>
						</button>
					</Upload>
				</Form.Item>
				<Form.Item label="Button">
					<Button>Button</Button>
				</Form.Item>
				<Form.Item label="Slider">
					<Slider />
				</Form.Item>
				<Form.Item label="ColorPicker">
					<ColorPicker />
				</Form.Item>
				<Form.Item label="Rate">
					<Rate />
				</Form.Item>
				<Form.Item label="Mentions">
					<Mentions defaultValue="@afc163" />
				</Form.Item>
			</Form>
		</Modal>
	);
}
