# nfs4_acl - NFSv4 Access Control Lists

JavaScript library implementing NFSv4 Access Control Lists basic ACL behaviour.

The library does not create the storage for the ACL, it will only check whether a specified access is granted for a user or not.

The library tries to be a very conservative for the memory allocations, it avoids splitting strings or doing things that require allocation or de-allocating memory to avoid V8 garbage collection starting at the node.js server.

# Example

Minimalistic test-case run is here

http://jsfiddle.net/1xynjga4/

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

# Memory conservation and speed - alternative approaches

To consume less `node.js/io.js` memory the class could allocate ArrayBuffer for the ACL based on the reference implementation.


# License.

MIT








