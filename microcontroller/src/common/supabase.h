#ifndef SUPABASE_H
#define SUPABASE_H

#include "ESPSupabase.h"

extern Supabase supabase;

/**
 * Loads the Supabase client (REQUIRED AT THE START).
 *
 * @param projectURL The Supabase project URL.
 * @param anonKey The Supabase project's anon key.
 * @param username The username for authentication.
 * @param password The password for authentication.
 * @return Whether loaded successfully.
 */
bool loadSupabase(const char *projectURL, const char *anonKey, const char *username, const char *password);

#endif