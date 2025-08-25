import React from 'react'

export default function UploadPayment({ open, close }: {
    open: boolean;
    close: () => void;
}) {
  return (
    <dialog open={open} className="fixed w-full h-full bg-[rgba(0,0,0,0.2)] left-0 top-0 hidden">
        <div className="backdrop:bg-gray-50 px-2 z-20">
            <div className="relative rounded-xl bg-[#2B3544] text-white p-5 mx-auto mt-[5rem] min-w-[10rem] md:min-w-[25rem] w-fit min-h-[10rem] max-h-[80vh] h-fit overflow-y-auto">
                <div className="mb-4">
                    <div id="paycheckerUploadFile" className="fixed w-full h-full bg-[rgba(0,0,0,0.2)] left-0 top-0 hidden">
                        <div className="backdrop:bg-gray-50 px-2 z-20">
                            <div className="relative rounded-xl bg-[#2B3544] text-white p-5 mx-auto mt-[5rem] min-w-[10rem] md:min-w-[25rem] w-fit min-h-[10rem] max-h-[80vh] h-fit overflow-y-auto">
                                <div className="mb-4">
                                    <h4 className="text-center font-[600] text-lg mt-2">Upload</h4>
                                    <div className="grid absolute right-[0.5rem] top-[0.5rem] text-2xl text-center text-accent-orange p-1 cursor-pointer" onClick={close}>&#10060;</div>
                                    <form  className="form">
                                        <div id="upload"></div>
                                        <div className="mb-3">
                                            <label htmlFor="avatarInput" className="form-label">Select Image</label>
                                            <input type="file" className="form-control" id="avatarInput" name="avatar" required />
                                        </div>
                                        <button 
                                            className="cursor-pointer btn btn-primary"
                                            hx-post="/paychecker/pay" 
                                            hx-encoding="multipart/form-data" 
                                            hx-target="#upload" 
                                            type="submit" >Upload</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </dialog>
  )
}
