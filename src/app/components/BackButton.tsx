'use client';

import { useRouter } from 'next/navigation';

const BackButton = ({ className = "" }: { className?: string }) => {
    const router = useRouter()
    return (
        <button
            type="button"
            className={`p-2 rounded-xl text-sm font-medium outline-none focus:outline-none border-4 border-transparent hover:text-gray-300 active:border-transparent active:text-grey-200 transition-all ${className}`}
            onClick={() => router.back()}
        >
            <div className="flex flex-row align-middle w-8 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill='currentColor' stroke='currentColor' xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 100 100" xmlSpace="preserve">
                    <g>
                        <path d="M46.1,54.4c-1.1,0-2,0.9-2,2L44,66.1L25.5,48.5L44,30.9V40c0,1.1,0.9,2,2,2s2-0.9,2-2V30c0-1.6-0.8-2.9-2.1-3.5   c-1.4-0.6-2.9-0.2-4,0.9L22.5,45.8c-0.7,0.7-1.1,1.7-1.1,2.7c0,1,0.4,2,1.2,2.8l18.8,17.8c0.7,0.7,1.7,1.1,2.7,1.1   c0.5,0,1-0.1,1.5-0.3c1.5-0.6,2.4-2,2.4-3.6l0.1-9.9C48.1,55.3,47.2,54.4,46.1,54.4z" />
                        <path d="M82,46H46c-1.1,0-2,0.9-2,2s0.9,2,2,2h36c1.1,0,2-0.9,2-2S83.1,46,82,46z" />
                    </g>
                </svg>
            </div>
        </button>
    );
};

export default BackButton;