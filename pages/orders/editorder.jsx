import React from 'react';
import { useRouter } from 'next/router';

const editorder = () => {
    const router = useRouter();
    const { id } = router.query;
    console.log('✌️id --->', id);

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                <h3 className="text-lg font-semibold dark:text-white-light">Edit Order</h3>
                <button type="button" className="btn btn-primary">
                    Add Order
                </button>
            </div>
            <div className="grid grid-cols-12 gap-5 ">
                <div className="panel col-span-9 mb-5 p-5 ">
                    <div>
                        <h3 className="text-lg font-semibold">Order #13754 Details</h3>
                        <p className=" pt-1 text-gray-500">Payment via Cash on delivery. Customer IP: 122.178.161.16</p>
                    </div>
                    <div className="mt-8">
                        <h5 className="mb-3 text-lg font-semibold">General</h5>
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-span-4">
                                <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                    Date created:
                                </label>

                                <input type="datetime-local" id="dateTimeCreated" name="dateTimeCreated" className="form-input" required />
                            </div>

                            <div className="col-span-4">
                                <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                    Status:
                                </label>
                                <select className="form-select">
                                    <option value="processing">Processing</option>
                                    <option value="onhold">On Hold</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="col-span-4">
                                <div className=" flex  items-center justify-between">
                                    <label htmlFor="status" className="block pr-2 text-sm font-medium text-gray-700">
                                        Customer:
                                    </label>
                                    <div>
                                        <p>
                                            <a href="#" className="mr-2 text-primary">
                                                Profile
                                            </a>
                                            /
                                            <a href="#" className="ml-2 text-primary">
                                                View Other Orders
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <input list="statusOptions" name="status" className="form-select" />

                                <datalist id="statusOptions">
                                    <option value="processing">processing</option>
                                    <option value="onhold">onhold</option>
                                    <option value="completed">completed</option>
                                </datalist>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panel col-span-3 mb-5 p-5 ">
                    <div className="mb-5 border-b border-gray-200 pb-2 ">
                        <h3 className="text-lg font-semibold">Order Notes</h3>
                    </div>
                    <div className="mb-5 border-b border-gray-200 pb-2 ">
                        <div className="mb-5">
                            <div className="text-gray-500">
                                <div className=" mb-2 bg-gray-100  p-3 ">Order status changed from Processing to Completed.</div>
                                <span class=" mr-1 border-b border-dotted border-gray-500">April 22, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
                                <span className="ml-2 cursor-pointer text-danger ">Delete note</span>
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="text-gray-500">
                                <div className="mb-2 bg-blue-200 p-3">Hi</div>
                                <span class="mr-1 border-b border-dotted border-gray-500">April 20, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
                                <span className="ml-2 cursor-pointer text-danger ">Delete note</span>
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="text-gray-500">
                                <div className="mb-2 bg-pink-200 p-3">Payment to be made upon delivery. Order status changed from Pending payment to Processing.</div>
                                <span class="mr-1 border-b border-dotted border-gray-500">April 20, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
                                <span className="ml-2 cursor-pointer text-danger ">Delete note</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-700">Add note</label>
                        <textarea className="form-textarea " rows="2" placeholder="Add a note"></textarea>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <select className="form-select mr-3">
                            <option value="private-note">Private note</option>
                            <option value="note-customer">Note to customer</option>
                        </select>
                       <button type="button" className="btn btn-outline-primary">Add</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default editorder;
