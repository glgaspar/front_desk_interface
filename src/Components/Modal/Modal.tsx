export default function Modal ({ children, title, close } : { children: any, title?: string, close: any, className?: string }) {
    return(
        <div className="fixed top-0 left-0 w-full h-full bg-black/20 px-2 z-20">
            <div className="relative rounded-xl p-5 mx-auto mt-[2rem] min-w-[10rem] md:min-w-[25rem] w-fit min-h-[10rem] max-h-[80vh] h-fit border border-[#b3078b] bg-black overflow-y-auto">
                <div className="mb-4">
                    <p className="text-center font-[600] text-lg mt-2 mx-2">{title}</p>
                    { close &&
                        <button 
                            className="grid absolute right-[0.5rem] top-[0.5rem] text-2xl text-center text-accent-orange p-1 cursor-pointer"
                            onClick={(e) => close(e)}
                            type="button"
                        >&times;</button>
                    }
                </div>
                { children }
            </div>
        </div>
    );
}