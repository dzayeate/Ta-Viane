import { FaSave, FaRegEdit } from "react-icons/fa";

const ButtonPreview = ({ isEditMode, clickHandler }) => {
  return (
    <button
      onClick={() => clickHandler && clickHandler()}
      className={`text-neutral-500 transition duration-200 hover:bg-neutral-100 hover:text-brand-500 p-[3px] text-[14px] h-fit rounded`}
    >
      {isEditMode ? <FaSave /> : <FaRegEdit />}
    </button>
  );
};

export default ButtonPreview;