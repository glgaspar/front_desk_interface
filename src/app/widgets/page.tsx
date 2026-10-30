"use client";
import React, { useEffect, useRef, useState } from "react";
import FrontEndWidgets, { widgetConfigs } from "./frontEndWidgets";
import { WidgetProvider } from "./sdk";
import Api from "@/Components/Api";
import toast from "react-hot-toast";
import Wrapper from "./wrapper";
import { useUser } from "@/Components/User";
import { ServerWidget } from "./Interfaces";

export default function Widgets() {
  const [availableWidgets, setAvailabledWidgets] = useState<ServerWidget[]|undefined>(undefined);
  const [showAll, setShowAll] = useState(false);
  const { isAdmin } = useUser();
  const [refresh, setRefresh] = useState(0);
  const checkedNewWidgets = useRef(false);
  const dragged = useRef<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

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
    if (!availableWidgets || checkedNewWidgets.current) return;
    checkedNewWidgets.current = true;

    const missing = Object.keys(FrontEndWidgets).filter(widget => !availableWidgets.some(w => w.name === widget));
    if (missing.length === 0) return;

    // the .then was running after the if, so it never refreshed. waiting for all of them now
    Promise.allSettled(missing.map(widget => Api().post("/widgets", {name: widget})))
      .then(results => {
        results.forEach((result, i) => {
          if (result.status === "rejected") {
            console.error(result.reason);
            toast.error("Failed to add widget " + missing[i]);
          }
        });
        if (results.some(result => result.status === "fulfilled")) {
          setRefresh(prev => prev + 1);
          toast.success("New widget found. Refreshing list.");
        }
      });
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

  // moves the dragged widget to where the target is and saves the whole order
  function drop(targetId: number) {
    setDropTarget(null);
    const from = availableWidgets?.findIndex(w => w.id === dragged.current) ?? -1;
    const to = availableWidgets?.findIndex(w => w.id === targetId) ?? -1;
    dragged.current = null;
    if (!availableWidgets || from < 0 || to < 0 || from === to) return;

    const ordered = [...availableWidgets];
    ordered.splice(to, 0, ordered.splice(from, 1)[0]);
    setAvailabledWidgets(ordered);

    Api()
      .put("/widgets/order", {ids: ordered.map(w => w.id)})
      .catch((error) => {
        console.error(error);
        toast.error("Failed to save the widget order");
        setRefresh(prev => prev + 1);
      });
  }

  return (
    <div className="w-full p-4">
      <div className={`flex justify-end items-center mb-6 ${isAdmin ? "" : "hidden"}`}>
        <div className="flex items-center gap-3">
          {showAll && <span className="text-xs text-gray-400">drag widgets to reorder</span>}
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
        <div className="columns-[29rem] gap-2">
          {availableWidgets?.map(widgetToRender => {
            const WidgetComponent = FrontEndWidgets[widgetToRender.name] as React.ElementType;
            if (!widgetToRender.enabled) return null;
            return WidgetComponent 
              ? <div
                  className={`flex justify-center break-inside-avoid mb-2 rounded-xl ${showAll ? "cursor-grab outline-1 outline-dashed outline-gray-600" : ""} ${dropTarget === widgetToRender.id ? "outline-2 outline-solid outline-[#b3078b]" : ""}`}
                  key={`enabled-widget-${widgetToRender.id}`}
                  draggable={showAll}
                  onDragStart={() => { dragged.current = widgetToRender.id; }}
                  onDragOver={(e) => { if (!showAll || dragged.current === null) return; e.preventDefault(); setDropTarget(widgetToRender.id); }}
                  onDragLeave={() => setDropTarget(prev => prev === widgetToRender.id ? null : prev)}
                  onDrop={(e) => { e.preventDefault(); drop(widgetToRender.id); }}
                  onDragEnd={() => { dragged.current = null; setDropTarget(null); }}>
                  <WidgetProvider name={widgetToRender.name} manifest={widgetConfigs[widgetToRender.name]} enabled={widgetToRender.enabled}>
                  <Wrapper 
                    key={widgetToRender.id}
                    title={widgetToRender.name.toUpperCase().replaceAll("_", " ")} 
                    enabled={widgetToRender.enabled}
                    selected={widgetToRender.selected}
                    updateToggleCallBack={(toggle: "enabled" | "selected") => updateToggleCallBack(widgetToRender.id, toggle)}>
                    <WidgetComponent key={widgetToRender.id} enabled={widgetToRender.enabled} selected={widgetToRender.selected} refreshCallBack={() => setRefresh(prev => prev + 1)}/> 
                  </Wrapper>
                  </WidgetProvider>
                </div>
              : null;
          })}
        </div>
        {
          showAll &&
          <>
            <hr className="p-5 border-[#b3078b]" />
            <h4 className="text-[500] text-center">Not enabled Widgets</h4>
            <div className="columns-[23rem] gap-2">
                {availableWidgets?.map(widgetToRender => {
                  const WidgetComponent = FrontEndWidgets[widgetToRender.name] as React.ElementType;
                  if (widgetToRender.enabled) return null;
                  return WidgetComponent 
                    ? <div className="flex justify-center break-inside-avoid" key={`disabled-widget-${widgetToRender.id}`}>
                        <WidgetProvider name={widgetToRender.name} manifest={widgetConfigs[widgetToRender.name]} enabled={widgetToRender.enabled}>
                        <Wrapper
                          key={widgetToRender.id}
                          title={widgetToRender.name.toUpperCase().replaceAll("_", " ")} 
                          enabled={widgetToRender.enabled}
                          selected={widgetToRender.selected}
                          updateToggleCallBack={(toggle: "enabled" | "selected") => updateToggleCallBack(widgetToRender.id, toggle)}
                          >
                          <WidgetComponent key={widgetToRender.id} enabled={widgetToRender.enabled} selected={widgetToRender.selected} refreshCallBack={() => setRefresh(prev => prev + 1)}/> 
                        </Wrapper>
                        </WidgetProvider>
                      </div>
                    : null;
                })}
            </div>
          </>
        }
    </div>
  );
}
