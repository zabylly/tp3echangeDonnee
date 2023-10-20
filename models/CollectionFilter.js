export default class CollectionFilter{
    constructor(objects,params,model) {
        this.objects =  objects;
        this.params =  params;
        this.model = model;
    }
    get()
    {
        let keys = [];
        if(this.params != null)
        {
            keys = Object.keys(this.params);
        }
        let objects = this.objects
        
        keys.forEach(key =>{
            if(this.model.isMember(key))
            {
                objects = objects.filter(object=>{
                    if(!Array.isArray(this.params[key]))
                        return this.valueMatch(object[key], this.params[key])
                });
            }
        });
        if(keys.includes("field"))
        {
            let keys = this.params["field"].split(",");

            objects = this.sortBy(this.getFields(objects,this.params["field"]),this.params["field"]);
            let positionInDouble =[];
            let previousObject=objects[0];
            //trouver les doublons
            for(let i=1;i<objects.length;i++)
            { 
                if(this.checkObjectsEqual(objects[i],previousObject,keys))
                {
                    positionInDouble.push(i);
                }
                previousObject=objects[i];
            }
            
            for(let i= positionInDouble.length -1;i>= 0;i--)
            { 
                objects.splice(positionInDouble[i], 1);
            }
        }
        if(keys.includes("sort"))
        {
            objects = this.sortBy(objects,this.params["sort"]);
        }
        if(keys.includes("limit") && keys.includes("offset"))
        {
            let start = this.params["limit"] * this.params["offset"];
            objects = objects.splice(start, this.params["limit"]);
        }
        return objects;
    }
    getFields(objects,propertiesString)
    {
        let propretiesArray = propertiesString.split(',');
        let isValid = true;

        propretiesArray.forEach(propretyName => {
            if(!this.model.isMember(propretyName))
            {
                isValid = false
                return;
            }
        });
        if(!isValid)
        {
            return objects;
        }


        let newObject = {};
        let newObjects = [];
        objects.forEach(object=>
        {
            propretiesArray.forEach(propretyName => {
                newObject[propretyName] = object[propretyName];
            });
            newObjects.push({...newObject});
        });
        return newObjects;
    }
    sortBy(objects,propertiesString) {

        let obj;
        let propretiesArray = propertiesString.split(',');
        let isValid = true;

        propretiesArray.forEach(propretyName => {
            propretyName = propretyName.split(" ");//gere le DESC
            if(!this.model.isMember(propretyName[0]))
            {
                isValid = false
                return;
            }
        });
        if(!isValid)
        {
            return objects;
        }

        let result;
        let propretyName
        obj = objects.sort((a, b) => {
            result = 0;

            for(let i=0;i<propretiesArray.length && result==0;i++)
            { 
                propretyName = propretiesArray[i].split(" ");//gere le DESC
                result = propretyName[1] && propretyName[1].toLowerCase() =="desc" ?  
                this.innerCompare(b[propretyName[0]], a[propretyName[0]]) //desc
                : this.innerCompare(a[propretyName[0]], b[propretyName[0]]);//asc

            }
          return result;
        });
        return obj;
    }
    checkObjectsEqual(obj1,obj2,keys)
    {
        let isEqual=true;
        for (const key of keys) {
            if (obj1[key] !== obj2[key]) {
                isEqual = false;
            }
        }
        return isEqual;
    }
    paramIsset(name)
    {

        if (this.params == null 
            || !(name in this.params)
            || this.params[name]=="") 
            return false;
        return true;
    }
    valueMatch(value, searchValue) {
        try {
        let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
        return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
        console.log(error);
        return false;
        }
    }
    compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }
    innerCompare(x, y) {
        
        if ((typeof x) === 'string')
        return x.localeCompare(y);
        else
        return this.compareNum(x, y);
    }
      
}
