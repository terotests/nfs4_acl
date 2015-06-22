var nfs4_acl_prototype = function() {
  'use strict';;
  (function(_myTrait_) {
    _myTrait_.find = function(username, rolename, rule) {

      var i = 0,
        line_i = 0,
        type_i = 0;
      length = this._acl.length;

      var type, flags, principal, permissions, flag, bGroup = false,
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
      debugger;

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

          if (mokCnt > 0 && (rule.length == mokCnt)) {
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
          mokCnt = 0
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

      if (mokCnt > 0 && (rule.length == mokCnt)) {
        if (type == "A") return true;
        if (type == "D") return false;
      }
      return false;

    }
    if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit"))
      _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
    if (!_myTrait_.__traitInit) _myTrait_.__traitInit = []
    _myTrait_.__traitInit.push(function(aclFile) {
      /*
A::OWNER@:rwatTnNcCy
A::alice@nfsdomain.org:rxtncy
A::bob@nfsdomain.org:rwadtTnNcCy
A:g:GROUP@:rtncy
D:g:GROUP@:waxTC
A::EVERYONE@:rtncy
D::EVERYONE@:waxTC
*/

      this._acl = aclFile;

      // type:flags:principal:permissions
      // Types : A, D, U, L

      /*
A principal is either a named user (e.g., 'myuser@nfsdomain.org') or group (provided the group flag is also set), 
or one of three special principals: 'OWNER@', 'GROUP@', and 'EVERYONE@', which are, respectively, analogous to the 
POSIX user/group/other distinctions used in, e.g., chmod(1).
*/
    });
  }(this));
}
var nfs4_acl = function(a, b, c, d, e, f, g, h) {
  if (this instanceof nfs4_acl) {
    var args = [a, b, c, d, e, f, g, h];
    if (this.__factoryClass) {
      var m = this;
      var res;
      this.__factoryClass.forEach(function(initF) {
        res = initF.apply(m, args);
      });
      if (Object.prototype.toString.call(res) == '[object Function]') {
        if (res._classInfo.name != nfs4_acl._classInfo.name) return new res(a, b, c, d, e, f, g, h);
      } else {
        if (res) return res;
      }
    }
    if (this.__traitInit) {
      var m = this;
      this.__traitInit.forEach(function(initF) {
        initF.apply(m, args);
      })
    } else {
      if (typeof this.init == 'function')
        this.init.apply(this, args);
    }
  } else return new nfs4_acl(a, b, c, d, e, f, g, h);
};
nfs4_acl._classInfo = {
  name: 'nfs4_acl'
};
nfs4_acl.prototype = new nfs4_acl_prototype();
if (typeof(window) != 'undefined') window['nfs4_acl'] = nfs4_acl;
if (typeof(window) != 'undefined') window['nfs4_acl_prototype'] = nfs4_acl_prototype;