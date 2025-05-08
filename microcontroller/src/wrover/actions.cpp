#include <common/camera_loader.h>
#include <common/supabase.h>
#include <common/utils.h>

void beep(uint8_t pin, uint32_t duration)
{
  digitalWrite(pin, HIGH);
  delay(duration);
  digitalWrite(pin, LOW);
}

void takePhotoToSupabase(const char *bucket, const char *folderName)
{
  camera_fb_t *fb = takePhoto();

  time_t now = time(NULL);

  char filename[128];
  snprintf(filename, sizeof(filename), "%s/%ld.jpg", folderName, now);

  int res = supabase.upload(bucket, filename, "image/jpeg", fb->buf, fb->len);

  esp_camera_fb_return(fb);
}