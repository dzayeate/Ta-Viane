import { FaSave, FaRegEdit } from "react-icons/fa";

const ButtonPreview = ({ isEditMode, clickHandler }) => {
  return (
    <button
      onClick={() => clickHandler && clickHandler()}
      className={`text-gray-500 transition duration-200 hover:bg-gray-100 hover:text-blue-500 p-[3px] text-[14px] h-fit rounded`}
    >
      {isEditMode ? <FaSave /> : <FaRegEdit />}
    </button>
  );
};

export default ButtonPreview;