#include <time.h>
#include <stdio.h>
#include <MD5Builder.h>
#include <common/utils.h>

void hashMD5(const char *input, char *output)
{
  MD5Builder md5;
  md5.begin();
  md5.add(input);
  md5.calculate();
  strcpy(output, md5.toString().c_str());
}
