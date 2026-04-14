"use client";
import React, { useEffect, useState } from "react";
import Api from "@/Components/Api";
import AvailableWidgets  from "@/app/widgets/availableWidgets";
import toast from "react-hot-toast";
import Wrapper from "@/app/widgets/wrapper";
import { ServerWidget } from "@/app/widgets/Interfaces";

export default function WidgetsRow() {
  const [selectedWidgets, setSelectedWidgets] = useState<ServerWidget[]|undefined>(undefined);

  useEffect(() => {
    Api()
      .get("/widgets?homeOnly=true")
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
    <div className="flex w-full overflow-x-scroll py-2">
      {selectedWidgets?.map(widgetToRender => {
        const WidgetComponent = AvailableWidgets[widgetToRender.name] as React.ElementType;
        if (!widgetToRender.enabled) return null;
        return WidgetComponent 
          ? <Wrapper 
              title={widgetToRender.name.toUpperCase().replaceAll("_", " ")} 
              key={widgetToRender.id}
              enabled={widgetToRender.enabled}
              selected={widgetToRender.selected}
              row={true}
              >
              <WidgetComponent key={widgetToRender.id} enabled={widgetToRender.enabled}selected={widgetToRender.selected} /> 
            </Wrapper>
          : null;
      })}
    </div>
	);
}