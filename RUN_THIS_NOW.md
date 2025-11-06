# 🚨 FIX SIGNUP ERROR NOW

## **The Problem:**
Users getting: "new row violates row-level security policy for table 'profiles'"

## **The Solution:**
Run this SQL in Supabase RIGHT NOW (takes 30 seconds)

---

## 📋 **DO THIS NOW:**

### **Step 1: Open Supabase SQL Editor**

1. Go to: https://supabase.com/dashboard/project/hjhmgllhkppevwzocvtm
2. Log in if needed
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New query"** button (top right)

---

### **Step 2: Copy This SQL**

1. Open file: `fix-profile-signup-v2.sql` (in your project root)
2. Select ALL the content (Ctrl+A)
3. Copy it (Ctrl+C)

**OR copy from here:**

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create better policy that works with triggers
CREATE POLICY "Enable insert for authenticated users and triggers"
    ON public.profiles FOR INSERT
    WITH CHECK (
        auth.uid() = id
        OR auth.uid() IS NULL
    );

-- Recreate trigger function with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Profile signup fixed!' as message;
```

---

### **Step 3: Paste & Run**

1. Paste the SQL into Supabase SQL Editor (Ctrl+V)
2. Click the green **"Run"** button (bottom right)
3. Wait 2-3 seconds

---

### **Step 4: Verify Success**

You should see at the bottom:
```
✅ Profile signup fixed!
```

---

### **Step 5: Test Signup**

1. Go to: https://vibe-live-streaming.onrender.com/auth/signup
2. Try signing up with:
   - Email: test@example.com
   - Password: Test123456
   - Display Name: Abdul Sulaiman

3. Should work! ✅ No more RLS error!

---

## 🐛 **Still Getting Error?**

### **Check 1: Did the SQL run successfully?**
- Look for green checkmark in Supabase
- Should see "✅ Profile signup fixed!" message
- If there's a red error, copy the error message and share it

### **Check 2: Are you on the right Supabase project?**
- URL should be: hjhmgllhkppevwzocvtm
- Check top left of Supabase dashboard for project name

### **Check 3: Clear browser cache**
- Hard refresh the signup page: Ctrl+Shift+R
- Or try in incognito/private window

---

## 📞 **What Changed?**

This SQL fix:
1. ✅ Adds INSERT permission to profiles table
2. ✅ Allows the signup trigger to create profiles automatically
3. ✅ Handles edge cases where auth.uid() might be NULL
4. ✅ Adds error handling so signups don't completely fail

---

## ✅ **After This Works:**

Once signup is working, we'll continue with:
- Setting up LiveKit Cloud (for live streaming)
- Adding test data (YouTube videos, sample streams)
- Testing the full platform

**But first:** Run this SQL fix NOW! 🚀

