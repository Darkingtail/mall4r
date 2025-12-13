import { Modal } from "antd";

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
		<Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}></Modal>
	);
}
