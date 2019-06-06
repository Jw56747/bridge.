import { BASE_PATH } from "../constants";
import TabSystem from "../TabSystem";
import JsonCacheUtils from "../editor/JSONCacheUtils";
//@ts-ignore
import Store from "../../store/index";
//@ts-ignore
import path from "path";
//@ts-ignore
import fs from "fs";
import Provider from "./Provider";
import JSONTree from "../editor/JsonTree";

let PARENT_CONTEXT: JSONTree = new JSONTree("");
let NODE_CONTEXT: JSONTree = new JSONTree("");
let PREV_CONTEXT: JSONTree[] = [];

export function walkSync(dir: string, filelist = []) {
    fs.readdirSync(dir).forEach((file: string) => {
  
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
  
    });
    return filelist;
}

export function SET_CONTEXT(node: JSONTree, parent: JSONTree) {
    PARENT_CONTEXT = parent;
    NODE_CONTEXT = node;
}
export function CONTEXT_UP() {
    PREV_CONTEXT.push(NODE_CONTEXT);
    if(NODE_CONTEXT !== undefined) NODE_CONTEXT = NODE_CONTEXT.parent;
    if(PARENT_CONTEXT !== undefined) PARENT_CONTEXT = PARENT_CONTEXT.parent;
}
export function CONTEXT_DOWN() {
    if(PREV_CONTEXT.length > 0) {
        PARENT_CONTEXT = NODE_CONTEXT;
        NODE_CONTEXT = PREV_CONTEXT.pop()!;
    } else if(NODE_CONTEXT !== undefined) {
        throw new Error("Called CONTEXT_DOWN without PREV_CONTEXT.");
    }
}

export const DYNAMIC = {
    list: {
        next_index() {
            if(NODE_CONTEXT.is_array) {
                let res = [];
                let arr = NODE_CONTEXT.toJSON();

                for(let i = arr.length; i >= 0; i--) {
                    res.push(i + "");
                }
                return res;
            }
            return [ "0" ];
        },
        index_pair() {
            return [ "0", "1" ];
        },
        index_triple() {
            return [ "0", "1", "2" ];
        }
    },
    setting: {
        target_version() {
            return Store.state.Settings.target_version;
        }
    },
    entity: {
        component_list() {
            return [];
        },
        cached_families() {
            return JsonCacheUtils.families;
        },
        component_groups() {
            try {
                return Object.keys(TabSystem.getSelected().content.get("minecraft:entity/component_groups").toJSON());
            } catch(e) {
                return [];
            }
        },
        events() {
            try {
                return Object.keys(TabSystem.getSelected().content.get("minecraft:entity/events").toJSON());
            } catch(e) {
                return [];
            }
        },
        all_events() {
            return JsonCacheUtils.events.map((e: string) => e);
        },
        "@events"() {
            return JsonCacheUtils.events.map((e: string) => "@s " + e);
        },
        animation_references() {
            try {
                return Object.keys(TabSystem.getSelected().content.get("minecraft:entity/description/animations").toJSON());
            } catch(e) {
                return [];
            }
        }
    },
    recipe: {
        pattern_keys(): string[] {
            try {
                let data = TabSystem.getSelected().content.get("minecraft:recipe_shaped/pattern").toJSON();
                return data.map((e: string) => e.split("")).reduce((acc: string[], curr: string) => acc.concat(curr), []);
            } catch(e) {
                return [];
            }
        }
    },
    biome: {
        name_references() {
            return walkSync(BASE_PATH + Store.state.Explorer.project.explorer + "\\biomes").map((e: string) => {
                return e.split(/\\|\//g).pop()!.replace(".json", "");
            });
        }
    },
    animation_controller: {
        current_states() {
            let current = TabSystem.getCurrentNavObj();
            if(Object.keys(current.toJSON()).length > 0) return [];

            
            while(current !== undefined && current.key !== "states") {
                current = current.parent;
            }
            if(current.key === "states") return Object.keys(current.toJSON());
            return [];
        }
    },
    animation_controller_ids() {
        return JsonCacheUtils.animation_controller_ids;
    },
    animation_ids() {
        return JsonCacheUtils.animation_ids;
    },
    siblings() {
        return PARENT_CONTEXT.toJSON();
    },
    children() {
        return NODE_CONTEXT.toJSON();
    },
    current_file_name() {
        let arr = TabSystem.getSelected().file_path.split(/\/|\\/g).pop().split(".");
        arr.pop()
        return [ arr.join(".") ];
    },
    loot_table_files() {
        try {
            return walkSync(BASE_PATH + Store.state.Explorer.project.explorer + "\\loot_tables").map((e: string) => {
                return e.replace(BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.explorer + "\\", "").replace(/\\/g, "/");
            });
        } catch(e) {
            return [];
        }
    },
    trade_table_files() {
        try {
            return walkSync(BASE_PATH + Store.state.Explorer.project.explorer + "\\trading").map((e: string) => {
                return e.replace(BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.explorer + "\\", "").replace(/\\/g, "/");
            });
        } catch(e) {
            return [];
        }
    },
    function_files() {
        try {
            return walkSync(BASE_PATH + Store.state.Explorer.project.explorer + "\\functions").map((e: string) => {
                return e.replace(BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.explorer + "\\functions\\", "").replace(/\\/g, "/").replace(".mcfunction", "");
            });
        } catch(e) {
            return [];
        }
    }
};