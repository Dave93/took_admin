import { FaWalking, FaMotorcycle } from "react-icons/fa";
import { AiFillCar } from "react-icons/ai";
import { MdDirectionsBike } from "react-icons/md";

const courierDriveTypeIcons: {
  [key: string]: JSX.Element;
} = {
  car: <AiFillCar />,
  bike: <FaMotorcycle />,
  foot: <FaWalking />,
  bycicle: <MdDirectionsBike />,
};

const CourierDriveTypeIcon = ({ driveType }: { driveType: string }) => {
  return (
    <div className="courier-drive-type-icon">
      {courierDriveTypeIcons[driveType]}
    </div>
  );
};

export default CourierDriveTypeIcon;
