"use client";
import React, { useEffect, useState } from "react";
import Api from "@/Components/Api";
import AvailableWidgets  from "@/app/widgets/availableWidgets";
import toast from "react-hot-toast";

export default function WidgetsRow() {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]|undefined>(undefined);

  useEffect(() => {
    Api()
      .get("/widgets/selected/home")
      .then((response) => {
        setSelectedWidgets(response.data.data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load widgets");
      })
  }, []);


    if (!selectedWidgets || selectedWidgets.length === 0) {
        return <></>
    }

	return (
    <div className="w-full overflow-x-auto pb-2">
      {selectedWidgets?.map(widgetToRender => {
        const Widget = AvailableWidgets[widgetToRender as keyof typeof AvailableWidgets];
        return <Widget key={widgetToRender} row={true} />;
      })}
    </div>
	);
}