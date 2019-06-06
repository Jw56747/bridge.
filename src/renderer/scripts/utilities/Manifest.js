import uuidv4 from "uuid/v4";
export default class Manifest {
    constructor(type, name, description, client_data) {
        this.format_version = 1;
        this.header = {
            description,
            name,
            uuid: uuidv4(),
            version: [1, 0, 0],
            min_engine_version: [1, 0, 0]
        };
        this.modules = [
            {
                type,
                uuid: uuidv4(),
                version: [1, 0, 0]
            }
        ];
        if (client_data) {
            this.modules.push({
                type: "client_data",
                uuid: uuidv4(),
                version: [1, 0, 0]
            });
        }
    }
    get() {
        return JSON.stringify(this, null, "\t");
    }
}
//# sourceMappingURL=Manifest.js.map