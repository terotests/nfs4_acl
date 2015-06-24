# nfs4_acl - NFSv4 Access Control Lists

JavaScript library implementing NFSv4 Access Control Lists basic ACL behaviour.

The library does not create the storage for the ACL, it will only check whether a specified access is granted for a user or not.

The library tries to be a very conservative for the memory allocations, it avoids splitting strings or doing things that require allocation or de-allocating memory to avoid V8 garbage collection starting at the node.js server.

# Example

Minimalistic test-case run is here

http://jsfiddle.net/17y60qe0/

# Initializing the ACL

```javascript

var file = "A::OWNER@:rwatTnNcCy\n"+
"A::alice@nfsdomain.org:rxtncy\n"+
"A::bob@nfsdomain.org:rwadtTnNcCy\n"+
"A:g:GROUP@:rtncy\n"+
"D:g:GROUP@:waxTC\n"+
"A::EVERYONE@:rtncy\n"+
"D::EVERYONE@:waxTC\n";

var acl = nfs4_acl( file );

```

# Checking for permission flags

For list of flags check: http://linux.die.net/man/5/nfs4_acl

## Checking for a single permission

```javascript
 if( acl.find("alice@nfsdomain.org", "", "r") ) {
    console.log("Alice has read access");
 }
```

## Checking for a multiple permission flags

You can check for multiple flags like "rwx" with single command, the command will match positively only if all the flags are found.

```javascript
 if( acl.find("alice@nfsdomain.org", "", "rwx") ) {
    console.log("Alice has read, write and execute flags");
 }
```

## Checking group permissions

```javascript
 if( acl.find("", "GROUP@", "r") ) {
    console.log("Group has read access");
 }
```

# Modifying the ACL

NOTE: Modifying the ACL is not memory -optimized. Strings are allocated and so on. But since it is assumed the ACL is assumed to be most of the time constant, it should not be a big problem.


## Adding permissions to users

```javascript
acl.allowUser("abcd", "rtncyw");   
```

## Removing permissions from users

```javascript
acl.denyUser("abcd", "rwx");   
```

## Adding permissions to groups

```javascript
acl.allowGroup("abcd", "r");   
```

## Removing permissions to groups

```javascript
acl.denyGroup("abcd", "waxTC");   
```

## Reading the ACL as String

```javascript
var resultStr = acl.getACL();
```


# Memory conservation and speed - alternative approaches

To consume less `node.js/io.js` memory the class could allocate ArrayBuffer for the ACL based on the reference implementation.


# License.

MIT

























   

 


   
#### Class nfs4_acl


- [addPermission](README.md#nfs4_acl_addPermission)
- [allowGroup](README.md#nfs4_acl_allowGroup)
- [allowUser](README.md#nfs4_acl_allowUser)
- [denyGroup](README.md#nfs4_acl_denyGroup)
- [denyUser](README.md#nfs4_acl_denyUser)
- [filter](README.md#nfs4_acl_filter)
- [find](README.md#nfs4_acl_find)
- [fromObject](README.md#nfs4_acl_fromObject)
- [getACL](README.md#nfs4_acl_getACL)
- [has](README.md#nfs4_acl_has)
- [map](README.md#nfs4_acl_map)
- [push](README.md#nfs4_acl_push)
- [reduce](README.md#nfs4_acl_reduce)
- [removeAll](README.md#nfs4_acl_removeAll)
- [removePermission](README.md#nfs4_acl_removePermission)
- [replaceLines](README.md#nfs4_acl_replaceLines)
- [toObject](README.md#nfs4_acl_toObject)



   


   





   
# Class nfs4_acl


The class has following internal singleton variables:
        
        
### <a name="nfs4_acl_addPermission"></a>nfs4_acl::addPermission(obj, flags)


```javascript

for(var i=0; i<flags.length;i++) {
    var permission = flags[i];
    if( obj.permissions.indexOf( permission ) < 0 ) 
        obj.permissions += permission;
}
```

### <a name="nfs4_acl_allowGroup"></a>nfs4_acl::allowGroup(groupName, flag)


```javascript
var did = false, me = this;
this.map( function(o) {
        if(o.principal==groupName && ! ( o.flags.indexOf("g") >= 0)) {
            if(o.type=="A") {
                did = true;
                me.addPermission( o, flag);
            }
            if(o.type=="D") {
                me.removePermission( o, flag);
            }            
        }
        return o;
    });
    
if(!did) {
    this.push("A:g:"+groupName+":"+flag);
}
```

### <a name="nfs4_acl_allowUser"></a>nfs4_acl::allowUser(username, flag)


```javascript

var did = false, me = this;
this.map( function(o) {
        if(o.principal==username && !( o.flags.indexOf("g") >= 0)) {
            if(o.type=="A") {
                did = true;
                me.addPermission( o, flag);
            }
            if(o.type=="D") {
                me.removePermission( o, flag);
            }            
        }
        return o;
    });
    
if(!did) {
    this.push("A::"+username+":"+flag);
}


```

### <a name="nfs4_acl_denyGroup"></a>nfs4_acl::denyGroup(groupName, flag)


```javascript
var did = false, me = this;
this.map( function(o) {
        if(o.principal==groupName && ! ( o.flags.indexOf("g") >= 0)) {
            did = true;
            if(o.type=="A") {
                me.removePermission( o, flag);
            }
            if(o.type=="D") {
                me.addPermission( o, flag);
            }            
        }
        return o;
    });
    
if(!did) {
    this.push("D:g:"+groupName+":"+flag);
}
```

### <a name="nfs4_acl_denyUser"></a>nfs4_acl::denyUser(username, flag)


```javascript

var did = false, me = this;
this.map( function(o) {
        if(o.principal==username && ! ( o.flags.indexOf("g") >= 0)) {
            
            if(o.type=="A") {
                me.removePermission( o, flag);
            }
            if(o.type=="D") {
                did = true;
                me.addPermission( o, flag);
            }            
        }
        return o;
    });
    
if(!did) {
    this.push("D::"+username+":"+flag);
}

```

### <a name="nfs4_acl_filter"></a>nfs4_acl::filter(fn)


```javascript
var list = this._acl.split("\n");
list.filter(fn);
this._acl = list.join("\n");

return this;
```

### <a name="nfs4_acl_find"></a>nfs4_acl::find(username, rolename, rule)


```javascript
return this.has( username, rolename, rule);
```

### <a name="nfs4_acl_fromObject"></a>nfs4_acl::fromObject(obj)


```javascript
return obj.type+":"+obj.flags+":"+obj.principal+":"+obj.permissions;
```

### <a name="nfs4_acl_getACL"></a>nfs4_acl::getACL(t)


```javascript
return this._acl;
```

### <a name="nfs4_acl_has"></a>nfs4_acl::has(username, rolename, rule)


```javascript

var i=0, line_i = 0, type_i=0, length = this._acl.length;

var type, flags, principal, permissions, flag, bGroup = false, 
    uni=0, uni_match = false, uni_failed=false, mCnt=0, mokCnt=0, ignore_line = false;
    
/*
A::OWNER@:rwatTnNcCy
A::alice@nfsdomain.org:rxtncy
A::bob@nfsdomain.org:rwadtTnNcCy
A:g:GROUP@:rtncy
D:g:GROUP@:waxTC
*/

while(i < length) {
    
    if(this._acl.charAt(i)==":") {
        line_i++;
        type_i++;
        i++;
        continue;
    }
    if( this._acl.charAt(i) == "\n" ) {
        line_i = 0;
        type_i = 0;
        i++;
        continue;        
    }    
    
    if( line_i==0 ) {
        
        if(mokCnt > 0 && ( rule.length == mokCnt)) {
            if(type=="A") return true;
            if(type=="D") return false;
        }        
        
        ignore_line = false;
        type = this._acl.charAt(i);
        line_i++;
        i++;
        uni_match = false;
        uni_failed = false;
        uni=0;
        mCnt=0;
        mokCnt=0
        bGroup = false;
        continue;
    }
    if(type_i==1) {
        flag = this._acl.charAt(i);
        if(flag=="g") bGroup = true;
        if(flag=="i") ignore_line = true;
        line_i++;
        i++;
        continue;
    }
    if(type_i==2) {
        if(bGroup) {
            if( this._acl.charAt(i) == rolename.charAt( uni++ ) ) {
                uni_match = true;
            } else {
                uni_match = false;
                uni_failed = true;
            }
        } else {
            if( this._acl.charAt(i) == username.charAt( uni++ ) ) {
                uni_match = true;
            } else {
                uni_match = false;
                uni_failed = true;
            }
        }
        line_i++;
        i++;
        continue;
    }    
    if(type_i==3) {
        if(uni_match && !uni_failed && !ignore_line) {
            if( rule.indexOf( this._acl.charAt(i) ) >= 0 ) {
                //if(type=="A") return true;
                //if(type=="D") return false;
                mokCnt++;
            }
        }
        line_i++;
        i++;
        continue;        
    }
    line_i++;
    i++;    
}

if(mokCnt > 0 && ( rule.length == mokCnt)) {
    if(type=="A") return true;
    if(type=="D") return false;
}  
return false;

```

### nfs4_acl::constructor( aclFile )
Initialize the ACL with new file
```javascript
this._acl = aclFile.trim();

// type:flags:principal:permissions
// Types : A, D, U, L

/*
A principal is either a named user (e.g., 'myuser@nfsdomain.org') or group (provided the group flag is also set), 
or one of three special principals: 'OWNER@', 'GROUP@', and 'EVERYONE@', which are, respectively, analogous to the 
POSIX user/group/other distinctions used in, e.g., chmod(1).
*/
```
        
### <a name="nfs4_acl_map"></a>nfs4_acl::map(fn)


```javascript

if(this._acl.length==0) return this;

var list = this._acl.split("\n");
var newList = list.map(this.toObject).map(fn).map(this.fromObject);
this._acl = newList.join("\n").trim();
return this;

```

### <a name="nfs4_acl_push"></a>nfs4_acl::push(line)


```javascript

var len = this._acl.length;

if( (len == 0) || this._acl.charAt(len-1)=="\n") {
    this._acl += line;
} else {
    this._acl += "\n"+line;
}

this._acl = this._acl.trim();
```

### <a name="nfs4_acl_reduce"></a>nfs4_acl::reduce(fn, initialValue)


```javascript
var list = this._acl.split("\n");
list.reduce(fn, initialValue);
this._acl = list.join("\n");

return this;
```

### <a name="nfs4_acl_removeAll"></a>nfs4_acl::removeAll(t)


```javascript
this._acl = "";
```

### <a name="nfs4_acl_removePermission"></a>nfs4_acl::removePermission(obj, flags)


```javascript

for(var i=0; i<flags.length;i++) {
    var permission = flags[i];
    if( obj.permissions.indexOf( permission ) >= 0 ) {
        obj.permissions = obj.permissions.replace(permission, "");
    }
}


```

### <a name="nfs4_acl_replaceLines"></a>nfs4_acl::replaceLines(fn)


```javascript

var list = this._acl.split("\n");

for(var i=0; i<list.length;i++) {
    var n = fn(list[i]);
    if(n) list[i] = n;
}

```

### <a name="nfs4_acl_toObject"></a>nfs4_acl::toObject(line)


```javascript
/*
A::OWNER@:rwatTnNcCy
A::alice@nfsdomain.org:rxtncy
A::bob@nfsdomain.org:rwadtTnNcCy
A:g:GROUP@:rtncy
D:g:GROUP@:waxTC
*/

var obj = {};
if(!line) return obj;

var parts = line.split(":");
// var type, flags, principal, permissions,
if(line.length>0) {
    obj.type = line.charAt(0);
    obj.flags = parts[1];
    obj.principal = parts[2];
    obj.permissions = parts[3];
}
return obj;
```



   


   




