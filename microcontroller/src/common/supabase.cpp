#include "ESPSupabase.h"

Supabase supabase;

bool loadSupabase(const char *projectURL, const char *anonKey, const char *username, const char *password)
{
  supabase.begin(projectURL, anonKey);
  int res = supabase.login_email(username, password);
  return res == 200;
}
