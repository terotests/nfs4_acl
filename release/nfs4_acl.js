// The code template begins here
"use strict";

(function () {

  var __amdDefs__ = {};

  // The class definition is here...
  var nfs4_acl_prototype = function nfs4_acl_prototype() {
    // Then create the traits and subclasses for this class here...

    (function (_myTrait_) {

      // Initialize static variables here...

      /**
       * @param float obj
       * @param float flags
       */
      _myTrait_.addPermission = function (obj, flags) {

        for (var i = 0; i < flags.length; i++) {
          var permission = flags[i];
          if (obj.permissions.indexOf(permission) < 0) obj.permissions += permission;
        }
      };

      /**
       * @param float groupName
       * @param float flag
       */
      _myTrait_.allowGroup = function (groupName, flag) {
        var did = false,
            me = this;
        this.map(function (o) {
          if (o.principal == groupName && !(o.flags.indexOf("g") >= 0)) {
            if (o.type == "A") {
              did = true;
              me.addPermission(o, flag);
            }
            if (o.type == "D") {
              me.removePermission(o, flag);
            }
          }
          return o;
        });

        if (!did) {
          this.push("A:g:" + groupName + ":" + flag);
        }
      };

      /**
       * @param String username
       * @param float flag
       */
      _myTrait_.allowUser = function (username, flag) {

        var did = false,
            me = this;
        this.map(function (o) {
          if (o.principal == username && !(o.flags.indexOf("g") >= 0)) {
            if (o.type == "A") {
              did = true;
              me.addPermission(o, flag);
            }
            if (o.type == "D") {
              me.removePermission(o, flag);
            }
          }
          return o;
        });

        if (!did) {
          this.push("A::" + username + ":" + flag);
        }
      };

      /**
       * @param float groupName
       * @param float flag
       */
      _myTrait_.denyGroup = function (groupName, flag) {
        var did = false,
            me = this;
        this.map(function (o) {
          if (o.principal == groupName && !(o.flags.indexOf("g") >= 0)) {
            did = true;
            if (o.type == "A") {
              me.removePermission(o, flag);
            }
            if (o.type == "D") {
              me.addPermission(o, flag);
            }
          }
          return o;
        });

        if (!did) {
          this.push("D:g:" + groupName + ":" + flag);
        }
      };

      /**
       * @param float username
       * @param float flag
       */
      _myTrait_.denyUser = function (username, flag) {

        var did = false,
            me = this;
        this.map(function (o) {
          if (o.principal == username && !(o.flags.indexOf("g") >= 0)) {

            if (o.type == "A") {
              me.removePermission(o, flag);
            }
            if (o.type == "D") {
              did = true;
              me.addPermission(o, flag);
            }
          }
          return o;
        });

        if (!did) {
          this.push("D::" + username + ":" + flag);
        }
      };

      /**
       * @param float fn
       */
      _myTrait_.filter = function (fn) {
        var list = this._acl.split("\n");
        list.filter(fn);
        this._acl = list.join("\n");

        return this;
      };

      /**
       * @param String username
       * @param float rolename
       * @param float rule
       */
      _myTrait_.find = function (username, rolename, rule) {
        return this.has(username, rolename, rule);
      };

      /**
       * @param float obj
       */
      _myTrait_.fromObject = function (obj) {
        return obj.type + ":" + obj.flags + ":" + obj.principal + ":" + obj.permissions;
      };

      /**
       * @param float t
       */
      _myTrait_.getACL = function (t) {
        return this._acl;
      };

      /**
       * @param float username
       * @param float rolename
       * @param float rule
       */
      _myTrait_.has = function (username, rolename, rule) {

        var i = 0,
            line_i = 0,
            type_i = 0,
            length = this._acl.length;

        var type,
            flags,
            principal,
            permissions,
            flag,
            bGroup = false,
            uni = 0,
            uni_match = false,
            uni_failed = false,
            mCnt = 0,
            mokCnt = 0,
            ignore_line = false;

        /*
        A::OWNER@:rwatTnNcCy
        A::alice@nfsdomain.org:rxtncy
        A::bob@nfsdomain.org:rwadtTnNcCy
        A:g:GROUP@:rtncy
        D:g:GROUP@:waxTC
        */

        while (i < length) {

          if (this._acl.charAt(i) == ":") {
            line_i++;
            type_i++;
            i++;
            continue;
          }
          if (this._acl.charAt(i) == "\n") {
            line_i = 0;
            type_i = 0;
            i++;
            continue;
          }

          if (line_i == 0) {

            if (mokCnt > 0 && rule.length == mokCnt) {
              if (type == "A") return true;
              if (type == "D") return false;
            }

            ignore_line = false;
            type = this._acl.charAt(i);
            line_i++;
            i++;
            uni_match = false;
            uni_failed = false;
            uni = 0;
            mCnt = 0;
            mokCnt = 0;
            bGroup = false;
            continue;
          }
          if (type_i == 1) {
            flag = this._acl.charAt(i);
            if (flag == "g") bGroup = true;
            if (flag == "i") ignore_line = true;
            line_i++;
            i++;
            continue;
          }
          if (type_i == 2) {
            if (bGroup) {
              if (this._acl.charAt(i) == rolename.charAt(uni++)) {
                uni_match = true;
              } else {
                uni_match = false;
                uni_failed = true;
              }
            } else {
              if (this._acl.charAt(i) == username.charAt(uni++)) {
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
          if (type_i == 3) {
            if (uni_match && !uni_failed && !ignore_line) {
              if (rule.indexOf(this._acl.charAt(i)) >= 0) {
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

        if (mokCnt > 0 && rule.length == mokCnt) {
          if (type == "A") return true;
          if (type == "D") return false;
        }
        return false;
      };

      if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit")) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
      if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
      _myTrait_.__traitInit.push(function (aclFile) {
        this._acl = aclFile.trim();

        // type:flags:principal:permissions
        // Types : A, D, U, L

        /*
        A principal is either a named user (e.g., 'myuser@nfsdomain.org') or group (provided the group flag is also set), 
        or one of three special principals: 'OWNER@', 'GROUP@', and 'EVERYONE@', which are, respectively, analogous to the 
        POSIX user/group/other distinctions used in, e.g., chmod(1).
        */
      });

      /**
       * @param float fn
       */
      _myTrait_.map = function (fn) {

        if (this._acl.length == 0) return this;

        var list = this._acl.split("\n");
        var newList = list.map(this.toObject).map(fn).map(this.fromObject);
        this._acl = newList.join("\n").trim();
        return this;
      };

      /**
       * @param float line
       */
      _myTrait_.push = function (line) {

        var len = this._acl.length;

        if (len == 0 || this._acl.charAt(len - 1) == "\n") {
          this._acl += line;
        } else {
          this._acl += "\n" + line;
        }

        this._acl = this._acl.trim();
      };

      /**
       * @param float fn
       * @param float initialValue
       */
      _myTrait_.reduce = function (fn, initialValue) {
        var list = this._acl.split("\n");
        list.reduce(fn, initialValue);
        this._acl = list.join("\n");

        return this;
      };

      /**
       * @param float t
       */
      _myTrait_.removeAll = function (t) {
        this._acl = "";
      };

      /**
       * @param float obj
       * @param float flags
       */
      _myTrait_.removePermission = function (obj, flags) {

        for (var i = 0; i < flags.length; i++) {
          var permission = flags[i];
          if (obj.permissions.indexOf(permission) >= 0) {
            obj.permissions = obj.permissions.replace(permission, "");
          }
        }
      };

      /**
       * @param float fn
       */
      _myTrait_.replaceLines = function (fn) {

        var list = this._acl.split("\n");

        for (var i = 0; i < list.length; i++) {
          var n = fn(list[i]);
          if (n) list[i] = n;
        }
      };

      /**
       * @param float line
       */
      _myTrait_.toObject = function (line) {
        /*
        A::OWNER@:rwatTnNcCy
        A::alice@nfsdomain.org:rxtncy
        A::bob@nfsdomain.org:rwadtTnNcCy
        A:g:GROUP@:rtncy
        D:g:GROUP@:waxTC
        */

        var obj = {};
        if (!line) return obj;

        var parts = line.split(":");
        // var type, flags, principal, permissions,
        if (line.length > 0) {
          obj.type = line.charAt(0);
          obj.flags = parts[1];
          obj.principal = parts[2];
          obj.permissions = parts[3];
        }
        return obj;
      };
    })(this);
  };

  var nfs4_acl = function nfs4_acl(a, b, c, d, e, f, g, h) {
    var m = this,
        res;
    if (m instanceof nfs4_acl) {
      var args = [a, b, c, d, e, f, g, h];
      if (m.__factoryClass) {
        m.__factoryClass.forEach(function (initF) {
          res = initF.apply(m, args);
        });
        if (typeof res == "function") {
          if (res._classInfo.name != nfs4_acl._classInfo.name) return new res(a, b, c, d, e, f, g, h);
        } else {
          if (res) return res;
        }
      }
      if (m.__traitInit) {
        m.__traitInit.forEach(function (initF) {
          initF.apply(m, args);
        });
      } else {
        if (typeof m.init == "function") m.init.apply(m, args);
      }
    } else return new nfs4_acl(a, b, c, d, e, f, g, h);
  };
  // inheritance is here

  nfs4_acl._classInfo = {
    name: "nfs4_acl"
  };
  nfs4_acl.prototype = new nfs4_acl_prototype();

  if (typeof define !== "undefined" && define !== null && define.amd != null) {
    define(__amdDefs__);
  }
}).call(new Function("return this")());