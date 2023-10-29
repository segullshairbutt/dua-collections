import { Amiri } from "next/font/google";

const arabic_font = Amiri({ weight: "400", subsets: ["arabic"] })
const Bismillah = () => {
    return (
        <h1 className='font-bold text-center sm:text-3xl text-2xl leading-tight' style={arabic_font.style}>
            ﷽
        </h1>
    );
};

export default Bismillah;