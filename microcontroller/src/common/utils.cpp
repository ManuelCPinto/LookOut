#include <time.h>
#include <stdio.h>
#include <MD5Builder.h>
#include <common/utils.h>

const char *hashMD5(const char *input)
{
  MD5Builder md5;
  md5.begin();
  md5.add(input);
  md5.calculate();
  return md5.toString().c_str();
}
