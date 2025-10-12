# Soft Delete Implementation Guide

## Overview

The FuturePad application implements a soft delete system for letters, which means when users "delete" a letter, it's not permanently removed from the database. Instead, it's marked as deleted and hidden from normal operations while preserving the data for potential recovery.

## Database Schema Changes

### Letter Model Fields

- `isDeleted`: Boolean field (default: false) - marks if letter is soft deleted
- `deletedAt`: Date field - timestamp when letter was soft deleted

## API Endpoints

### Standard Operations (Exclude Soft-Deleted)

All standard letter operations automatically exclude soft-deleted letters:

- `GET /letters` - Get all active letters (excludes soft-deleted)
- `GET /letters/:id` - Get single active letter (excludes soft-deleted)
- `PUT /letters/:id` - Update active letter (excludes soft-deleted)
- `DELETE /letters/:id/images/:imageIndex` - Delete image from active letter

### Soft Delete Operations

#### Soft Delete Letter

```
DELETE /letters/:id
```

- Marks letter as deleted (`isDeleted: true`)
- Sets deletion timestamp (`deletedAt: new Date()`)
- Letter becomes invisible to normal operations
- Data is preserved for recovery

#### Get Deleted Letters (Trash)

```
GET /letters/trash
```

- Returns all soft-deleted letters for the authenticated user
- Sorted by deletion date (newest first)
- Used for implementing a "trash" or "recycle bin" feature

#### Restore Letter

```
PATCH /letters/:id/restore
```

- Restores a soft-deleted letter
- Sets `isDeleted: false`
- Removes `deletedAt` timestamp
- Letter becomes visible in normal operations again

#### Permanent Delete

```
DELETE /letters/:id/permanent
```

- Permanently removes letter from database
- Deletes associated images from Cloudinary
- Cannot be undone - use with caution
- Typically used for admin cleanup or user-requested permanent deletion

## Frontend Integration

### Letter Service Methods

```typescript
// Soft delete (default delete behavior)
await letterService.deleteLetter(letterId);

// Get deleted letters for trash view
const deletedLetters = await letterService.getDeletedLetters();

// Restore a deleted letter
const restoredLetter = await letterService.restoreLetter(letterId);

// Permanent delete (admin/cleanup)
await letterService.permanentlyDeleteLetter(letterId);
```

### Letter Interface

The Letter interface includes soft delete fields:

```typescript
interface Letter {
  // ... other fields
  isDeleted?: boolean;
  deletedAt?: string;
}
```

## Benefits of Soft Delete

1. **Data Recovery**: Users can recover accidentally deleted letters
2. **Audit Trail**: Maintain history of what was deleted and when
3. **Compliance**: Meet data retention requirements
4. **User Experience**: Provide "undo" functionality
5. **Data Integrity**: Preserve relationships and references

## Implementation Details

### Query Filtering

All standard queries include `isDeleted: { $ne: true }` to exclude soft-deleted records:

```javascript
// Example: Get user's active letters
const letters = await Letter.find({
  userId: req.userId,
  isDeleted: { $ne: true },
});
```

### Automatic Exclusion

Soft-deleted letters are automatically excluded from:

- Letter listings
- Single letter retrieval
- Update operations
- Image management operations

### Explicit Inclusion

Soft-deleted letters are only included in:

- Trash/recycle bin queries (`isDeleted: true`)
- Admin queries (when explicitly requested)
- Restore operations

## Testing

Run the soft delete test suite:

```bash
node test-soft-delete.js
```

This test verifies:

- Letter creation and normal queries
- Soft delete functionality
- Query exclusion after soft delete
- Trash query inclusion
- Letter restoration
- Cleanup operations

## Best Practices

1. **Regular Cleanup**: Implement periodic cleanup of old soft-deleted records
2. **User Interface**: Provide clear trash/recycle bin interface
3. **Confirmation**: Require confirmation for permanent deletion
4. **Retention Policy**: Define how long soft-deleted records are kept
5. **Performance**: Consider indexing on `isDeleted` field for large datasets

## Future Enhancements

1. **Automatic Cleanup**: Scheduled job to permanently delete old soft-deleted records
2. **Bulk Operations**: Bulk restore/permanent delete operations
3. **Admin Interface**: Admin panel for managing deleted content
4. **Retention Policies**: Configurable retention periods per user/organization
5. **Audit Logging**: Track who deleted/restored what and when
