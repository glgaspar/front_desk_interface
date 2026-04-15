"use client";
import React, { useEffect, useState } from "react";
import FrontEndWidgets  from "./frontEndWidgets";
import Api from "@/Components/Api";
import toast from "react-hot-toast";
import Wrapper from "./wrapper";
import { ServerWidget } from "./Interfaces";

export default function Widgets() {
  const [availableWidgets, setAvailabledWidgets] = useState<ServerWidget[]|undefined>(undefined);
  const [showAll, setShowAll] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    Api()
      .get("/widgets")
      .then((response) => {
          setAvailabledWidgets(response?.data?.data || []);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load widgets");
      })
  }, [refresh]);

  useEffect(() => {
    if (!availableWidgets) return;
    let added = false;
    for (const widget of Object.keys(FrontEndWidgets) || []) {
      if (!availableWidgets?.some(w => w.name === widget)) {
        Api()
          .post("/widgets", {name: widget})
          .then(() => {
              added = true;
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to add widget " + widget);
          })
        }
      }
    if (added) {
      setRefresh(prev => prev + 1);
      toast.success("New widget found. Refreshing list.");
    }
  }, [availableWidgets])

  function updateToggleCallBack(id:number, toggle: "enabled" | "selected") {
    Api()
      .put("/widgets/toggle/" + id + "/"+ toggle)
      .then(() => {
        setRefresh(prev => prev + 1);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to update widget " + id);
      });
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Edit Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(29rem,1fr))] gap-2">
          {availableWidgets?.map(widgetToRender => {
            const WidgetComponent = FrontEndWidgets[widgetToRender.name] as React.ElementType;
            if (!widgetToRender.enabled) return null;
            return WidgetComponent 
              ? <div className="flex justify-center">
                  <Wrapper 
                    key={widgetToRender.id}
                    title={widgetToRender.name.toUpperCase().replaceAll("_", " ")} 
                    enabled={widgetToRender.enabled}
                    selected={widgetToRender.selected}
                    updateToggleCallBack={(toggle: "enabled" | "selected") => updateToggleCallBack(widgetToRender.id, toggle)}>
                    <WidgetComponent key={widgetToRender.id} enabled={widgetToRender.enabled} selected={widgetToRender.selected} refreshCallBack={() => setRefresh(prev => prev + 1)}/> 
                  </Wrapper>
                </div>
              : null;
          })}
        </div>
        {
          showAll &&
          <>
            <hr className="p-5 border-[#b3078b]" />
            <h4 className="text-[500] text-center">Not enabled Widgets</h4>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(29rem,1fr))] gap-2">
                {availableWidgets?.map(widgetToRender => {
                  const WidgetComponent = FrontEndWidgets[widgetToRender.name] as React.ElementType;
                  if (widgetToRender.enabled) return null;
                  return WidgetComponent 
                    ? <div className="flex justify-center">
                        <Wrapper
                          key={widgetToRender.id}
                          title={widgetToRender.name.toUpperCase().replaceAll("_", " ")} 
                          enabled={widgetToRender.enabled}
                          selected={widgetToRender.selected}
                          updateToggleCallBack={(toggle: "enabled" | "selected") => updateToggleCallBack(widgetToRender.id, toggle)}
                          >
                          <WidgetComponent key={widgetToRender.id} enabled={widgetToRender.enabled} selected={widgetToRender.selected} refreshCallBack={() => setRefresh(prev => prev + 1)}/> 
                        </Wrapper>
                      </div>
                    : null;
                })}
            </div>
          </>
        }
    </div>
  );
}
